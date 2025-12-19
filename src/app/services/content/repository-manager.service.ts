import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(
    private storage: RepositoryStorageService,
    private http: HttpClient
  ) {}

  async initialize(): Promise<void> {
    this.repositories = await this.storage.getRepositories();

    // Initialize providers for enabled repositories
    for (const repo of this.repositories) {
      if (repo.enabled) {
        await this.createProvider(repo);
      }
    }
  }

  async getRepositories(): Promise<ContentRepository[]> {
    return [...this.repositories];
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
       status: { state: 'connected' },
       validationResult: validation
     };

    // Add to storage
    await this.storage.addRepository(repository);
    this.repositories.push(repository);

    // Create provider if enabled
    if (repository.enabled) {
      await this.createProvider(repository);
    }
  }

  async removeRepository(repoId: string): Promise<void> {
    // Remove from storage
    await this.storage.removeRepository(repoId);

    // Remove from local list
    this.repositories = this.repositories.filter(r => r.id !== repoId);

    // Remove provider
    this.providers.delete(repoId);
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
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) return;

    try {
      const provider = this.providers.get(repoId);
      if (!provider) {
        repo.status = { state: 'error', lastError: 'Provider not available' };
      } else {
        const available = await provider.isAvailable();
        repo.status = {
          state: available ? 'connected' : 'offline',
          roundsCount: repo.manifest?.rounds.length,
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      repo.status = {
        state: 'error',
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    await this.storage.updateRepository(repoId, { status: repo.status });
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