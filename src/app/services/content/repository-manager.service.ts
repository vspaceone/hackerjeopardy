import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  ContentRepository,
  RepositoryValidationResult,
  RepositoryStatus
} from './content.types';
import { RepositoryStorageService } from './repository-storage.service';
import { GitHubContentProvider } from './providers/github-content.provider';

@Injectable({
  providedIn: 'root'
})
export class RepositoryManagerService {
  private repositories: ContentRepository[] = [];
  private providers: Map<string, GitHubContentProvider> = new Map();
  private repositoryChanges = new Subject<{type: 'added' | 'removed' | 'updated', repository?: ContentRepository, repoId?: string}>();

  constructor(
    private storage: RepositoryStorageService,
    private http: HttpClient
  ) {}

  async initialize(): Promise<void> {
    console.log('RepositoryManager: Initializing...');
    this.repositories = await this.storage.getRepositories();
    console.log('RepositoryManager: Loaded repositories:', this.repositories.length);

    // Initialize providers for enabled repositories
    for (const repo of this.repositories) {
      console.log('RepositoryManager: Repository:', repo.id, 'enabled:', repo.enabled);
      if (repo.enabled) {
        await this.createProvider(repo);
      }
    }
    console.log('RepositoryManager: Initialized with providers:', this.providers.size);
  }

  async getRepositories(): Promise<ContentRepository[]> {
    return [...this.repositories];
  }

  getRepositoryChanges(): Observable<{type: 'added' | 'removed' | 'updated', repository?: ContentRepository, repoId?: string}> {
    return this.repositoryChanges.asObservable();
  }

  async addRepository(repoConfig: Omit<ContentRepository, 'id' | 'addedAt'>): Promise<void> {
    // Validate the repository first
    const validation = await this.validateRepository(repoConfig.url);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Repository validation failed');
    }

    // Generate unique ID
    const id = this.generateRepositoryId(repoConfig.url);

    // Check if repository already exists
    const existing = this.repositories.find(r => r.id === id);
    if (existing) {
      throw new Error('Repository already added');
    }

     // Create repository object
      const repository: ContentRepository = {
        ...repoConfig,
        id,
        addedAt: new Date(),
        githubUrl: repoConfig.url, // Set githubUrl for provider creation
        manifest: validation.manifest, // Store the manifest from validation
        status: { state: 'connected' },
        validationResult: validation
      };

    // Add to storage
    await this.storage.addRepository(repository);
    this.repositories.push(repository);

    // Create provider if enabled
    if (repository.enabled) {
      console.log('RepositoryManager: Creating provider for repository:', repository.id, repository.githubUrl);
      await this.createProvider(repository);
      console.log('RepositoryManager: Provider created, providers count:', this.providers.size);
    }

    // Notify listeners of the change
    this.repositoryChanges.next({ type: 'added', repository });
  }

  async removeRepository(repoId: string): Promise<void> {
    // Remove from storage
    await this.storage.removeRepository(repoId);

    // Remove from local list
    this.repositories = this.repositories.filter(r => r.id !== repoId);

    // Remove provider
    this.providers.delete(repoId);

    // Notify listeners of the change
    this.repositoryChanges.next({ type: 'removed', repoId });
  }

  async updateRepository(repoId: string, updates: Partial<ContentRepository>): Promise<void> {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) return;

    // Update local copy
    Object.assign(repo, updates);

    // Update storage
    await this.storage.updateRepository(repoId, updates);

    // Recreate provider if URL changed or enabled status changed
    if (updates.url || updates.enabled !== undefined) {
      if (repo.enabled) {
        await this.createProvider(repo);
      } else {
        this.providers.delete(repoId);
      }
    }

    // Notify listeners of the change
    this.repositoryChanges.next({ type: 'updated', repository: repo });
  }

  async validateRepository(url: string): Promise<RepositoryValidationResult> {
    try {
      const [owner, repo] = url.split('/');
      if (!owner || !repo) {
        return { isValid: false, error: 'Invalid GitHub URL format. Use "owner/repo"' };
      }

      const pagesUrl = `https://${owner}.github.io/${repo}`;

      // Try to fetch manifest
      const response = await fetch(`${pagesUrl}/manifest.json`);
      if (!response.ok) {
        if (response.status === 404) {
          return {
            isValid: false,
            error: 'Repository not found or GitHub Pages not enabled. Make sure the repository exists and has GitHub Pages enabled.'
          };
        }
        return {
          isValid: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const manifest = await response.json();

      // Validate manifest structure
      if (!manifest.rounds || !Array.isArray(manifest.rounds)) {
        return {
          isValid: false,
          error: 'Invalid manifest format: missing or invalid "rounds" array'
        };
      }

      if (manifest.rounds.length === 0) {
        return {
          isValid: false,
          error: 'Repository has no rounds available'
        };
      }

      // Basic validation of round structure
      for (const round of manifest.rounds) {
        if (!round.id || !round.name) {
          return {
            isValid: false,
            error: 'Invalid round format: missing id or name'
          };
        }
      }

      return {
        isValid: true,
        manifest: {
          ...manifest,
          repository: {
            name: url,
            ...manifest.repository
          }
        }
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getProvider(repoId: string): GitHubContentProvider | null {
    return this.providers.get(repoId) || null;
  }

  getRepository(repoId: string): ContentRepository | null {
    return this.repositories.find(r => r.id === repoId) || null;
  }

  async refreshRepositoryStatus(repoId: string): Promise<void> {
    console.log('RepositoryManager: Refreshing status for repo:', repoId);
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) {
      console.log('RepositoryManager: Repository not found:', repoId);
      return;
    }

    try {
      const provider = this.providers.get(repoId);
      console.log('RepositoryManager: Provider found:', !!provider);
      if (!provider) {
        repo.status = { state: 'error', lastError: 'Provider not available' };
      } else {
        console.log('RepositoryManager: Checking provider availability and fetching manifest...');
        const available = await provider.isAvailable();
        console.log('RepositoryManager: Provider available:', available);

        if (available) {
          // Fetch the latest manifest to update repository info
          try {
            const manifest = await firstValueFrom(provider.getManifest());
            console.log('RepositoryManager: Fetched manifest with', manifest?.rounds?.length || 0, 'rounds:', manifest?.rounds?.map(r => r.id));
            repo.manifest = manifest;
            repo.roundsCount = manifest?.rounds?.length;
            console.log('RepositoryManager: Updated repo roundsCount to', repo.roundsCount);
          } catch (manifestError) {
            console.warn('RepositoryManager: Failed to fetch manifest:', manifestError);
            repo.status = { state: 'error', lastError: 'Failed to fetch manifest' };
          }
        }

        repo.status = {
          state: available ? 'connected' : 'offline',
          roundsCount: repo.roundsCount,
          lastUpdated: new Date().toISOString()
        };
        console.log('RepositoryManager: Status updated to:', repo.status.state, 'with', repo.status.roundsCount, 'rounds');
      }
    } catch (error) {
      console.log('RepositoryManager: Error refreshing status:', error);
      repo.status = {
        state: 'error',
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    await this.storage.updateRepository(repoId, { status: repo.status, manifest: repo.manifest, roundsCount: repo.roundsCount });
  }

  private async createProvider(repository: ContentRepository): Promise<void> {
    const provider = new GitHubContentProvider(
      this.http,
      repository.id,
      repository.githubUrl,
      repository.priority
    );

    this.providers.set(repository.id, provider);
  }

  private generateRepositoryId(githubUrl: string): string {
    // Create a URL-safe ID from the GitHub URL
    return githubUrl
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase();
  }
}