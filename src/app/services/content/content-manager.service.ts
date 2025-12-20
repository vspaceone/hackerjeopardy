import { Injectable } from '@angular/core';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import { RepositoryManagerService } from './repository-manager.service';
import { CachedContentProvider } from './providers/cached-content.provider';
import { LocalContentProvider } from './providers/local-content.provider';
import { ContentValidatorService } from './content-validator.service';
import {
  ContentProvider,
  RoundMetadata,
  GameRound,
  Category,
  ContentUpdateInfo,
  ContentManifest
} from './content.types';

@Injectable({
  providedIn: 'root'
})
export class ContentManagerService {
  private providers: ContentProvider[] = [];
  private availableRoundsSubject = new BehaviorSubject<RoundMetadata[]>([]);

  constructor(
    private repositoryManager: RepositoryManagerService,
    private cachedProvider: CachedContentProvider,
    private localProvider: LocalContentProvider,
    private validator: ContentValidatorService
  ) {
    // Listen for repository changes to update providers dynamically
    this.repositoryManager.getRepositoryChanges().subscribe(change => {
      console.log('ContentManager: Repository change detected:', change.type, change.repository?.id || change.repoId);
      this.updateProviders();
    });
  }

  /**
   * Update the providers array when repositories change
   */
  private async updateProviders(): Promise<void> {
    console.log('ContentManager: Updating providers...');

    // Keep cached and local providers, replace GitHub providers
    const githubProviders = this.providers.filter(p => p.name !== 'Cache' && p.name !== 'Local');
    this.providers = [this.cachedProvider];

    // Add GitHub providers for current enabled repositories
    const repositories = await this.repositoryManager.getRepositories();
    console.log('ContentManager: Found', repositories.length, 'repositories');

    for (const repo of repositories.filter(r => r.enabled)) {
      console.log('ContentManager: Adding provider for enabled repo:', repo.id, 'url:', repo.githubUrl);
      const provider = this.repositoryManager.getProvider(repo.id);
      if (provider) {
        this.providers.push(provider);
        console.log('ContentManager: Added provider:', provider.name, 'type:', provider.constructor.name);
      } else {
        console.warn('ContentManager: No provider found for repo:', repo.id, '- checking if it exists in RepositoryManager');
        // Try to create the provider if it doesn't exist
        const repoObj = await this.repositoryManager.getRepository(repo.id);
        if (repoObj) {
          console.log('ContentManager: Repository exists, trying to create provider...');
          // This shouldn't happen normally, but let's see
        }
      }
    }

    // Add local provider last
    this.providers.push(this.localProvider);

    console.log('ContentManager: Updated providers:', this.providers.map(p => `${p.name} (priority: ${p.priority})`));

    // Load available rounds after provider update
    this.loadAvailableRounds();
  }

  async initialize(): Promise<void> {
    console.log('ContentManagerService: Initializing...');
    await this.repositoryManager.initialize();

    // Clean expired cache entries on startup
    try {
      await this.cachedProvider.cleanupExpiredEntries();
      console.log('ContentManagerService: Cleaned expired cache entries');
    } catch (error) {
      console.warn('ContentManagerService: Failed to cleanup expired entries:', error);
    }

    // Set up initial provider chain
    this.providers = [
      this.cachedProvider, // Highest priority - check cache first
    ];

    console.log('ContentManagerService: Initial providers:', this.providers.map(p => p.name));

    // Add GitHub providers for enabled repositories and local provider
    await this.updateProviders();

    // Load initial available rounds
    this.loadAvailableRounds();

    console.log('ContentManagerService: Initialization complete');
  }

  /**
   * Get all available rounds from all enabled repositories
   */
  getAvailableRounds(): Observable<RoundMetadata[]> {
    return this.availableRoundsSubject.asObservable();
  }

  /**
   * Load available rounds from current providers
   */
  private loadAvailableRounds(): void {
    console.log('ContentManager: Getting available rounds from providers:', this.providers.map(p => `${p.name} (priority: ${p.priority})`));
    console.log('ContentManager: Total providers:', this.providers.length);

    combineLatest(
      this.providers.map(provider => this.getRoundsFromProvider(provider))
    ).pipe(
      map(roundsArrays => {
        console.log('ContentManager: Raw rounds arrays from providers:', roundsArrays.map((arr, i) => `${i}: ${arr.length} rounds`));
        roundsArrays.forEach((arr, i) => {
          console.log(`ContentManager: Provider ${i} rounds:`, arr.map(r => r.id));
        });
        // Flatten and remove duplicates (prefer higher priority providers)
        const allRounds = roundsArrays.flat();
        console.log('ContentManager: Flattened rounds:', allRounds.length);
        const roundMap = new Map<string, RoundMetadata>();

        allRounds.forEach(round => {
          if (!roundMap.has(round.id)) {
            roundMap.set(round.id, round);
          }
        });

        const finalRounds = Array.from(roundMap.values());
        console.log('ContentManager: Final rounds after deduplication:', finalRounds.length);
        finalRounds.forEach(round => {
          console.log(`  - ${round.id}: ${round.name} (${round.categories?.length || 0} categories)`);
        });
        return finalRounds;
      }),
      catchError(error => {
        console.error('ContentManager: Error getting available rounds:', error);
        return of([]);
      })
     ).subscribe(async rounds => {
       this.availableRoundsSubject.next(rounds);

       // Cache the combined manifest for offline use
       try {
         const combinedManifest: ContentManifest = {
           rounds,
           lastUpdated: new Date().toISOString(),
           totalRounds: rounds.length,
           totalSize: 0, // Could calculate if needed
           version: 'combined'
         };
         await this.cachedProvider.cacheManifest(combinedManifest);
         console.log('ContentManager: Cached combined manifest with', rounds.length, 'rounds');
       } catch (error) {
         console.warn('ContentManager: Failed to cache combined manifest:', error);
       }
     });
  }

  /**
   * Load a complete round by ID, trying providers in priority order
   */
  async loadRound(roundId: string): Promise<GameRound> {
    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        const round = await firstValueFrom(provider.getRound(roundId));
        if (round) {
          // Validate the round
          const validation = this.validator.validateGameRound(round);
          if (!validation.isValid) {
            console.warn(`Round ${roundId} validation failed:`, validation.errors);
            continue; // Try next provider
          }

          // Cache the round if loaded from non-cache provider
          if (provider !== this.cachedProvider) {
            await this.cachedProvider.cacheRound(roundId, round);
          }

          return round;
        }
      } catch (error) {
        console.debug(`Provider ${provider.name} failed to load round ${roundId}:`, error);
        continue;
      }
    }

    throw new Error(`Round ${roundId} not found in any provider`);
  }

  /**
   * Load a category by round ID and category name, trying providers in priority order
   */
  async loadCategory(roundId: string, categoryName: string): Promise<Category> {
    console.log(`ContentManagerService: Loading category ${categoryName} for round ${roundId}`);
    console.log('ContentManagerService: Available providers:', this.providers.map(p => p.name));

    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      console.log(`ContentManagerService: Trying provider ${provider.name} (priority: ${provider.priority})`);
      try {
        const category = await firstValueFrom(provider.getCategory(roundId, categoryName));
        if (category) {
          console.log(`ContentManagerService: Successfully loaded from ${provider.name}`);
          // Validate the category
          const validation = this.validator.validateCategory(category);
          if (!validation.isValid) {
            console.warn(`Category ${categoryName} validation failed:`, validation.errors);
            continue; // Try next provider
          }

          // Cache the category if loaded from non-cache provider
          if (provider !== this.cachedProvider) {
            await this.cachedProvider.cacheCategory(roundId, categoryName, category);
          }

          return category;
        }
      } catch (error) {
        console.log(`ContentManagerService: Provider ${provider.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error(`Category ${categoryName} not found in any provider`);
  }

  /**
   * Get image URL for a specific round/category/image
   */
  getImageUrl(roundId: string, categoryName: string, imageName: string): string {
    // Try providers in order, return first available URL
    for (const provider of this.providers) {
      try {
        const url = provider.getImageUrl(roundId, categoryName, imageName);
        if (url) {
          return url;
        }
      } catch (error) {
        continue;
      }
    }

    // Fallback to empty string or default image
    return '';
  }

  /**
   * Check if any content is available
   */
  async isContentAvailable(): Promise<boolean> {
    try {
      const rounds = await firstValueFrom(this.getAvailableRounds());
      return rounds.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get content statistics
   */
  async getContentStats() {
    const rounds = await firstValueFrom(this.getAvailableRounds());
    const cacheStats = await this.cachedProvider.getCacheStats();

    return {
      totalRounds: rounds.length,
      ...cacheStats
    };
  }

  /**
   * Clear all cached content
   */
  async clearCache(): Promise<void> {
    await this.cachedProvider.clearCache();
  }

  /**
   * Preload rounds for offline use
   */
  async preloadRounds(roundIds: string[]): Promise<void> {
    for (const roundId of roundIds) {
      try {
        await this.loadRound(roundId);
        // Load all categories for the round
        const round = await this.loadRound(roundId);
        for (const categoryName of round.categories) {
          await this.loadCategory(roundId, categoryName);
        }
      } catch (error) {
        console.warn(`Failed to preload round ${roundId}:`, error);
      }
    }
  }

  /**
    * Private helper: Get rounds from a single provider
    */
   private getRoundsFromProvider(provider: ContentProvider): Observable<RoundMetadata[]> {
     console.log(`ContentManager: Trying to get manifest from ${provider.name} (priority: ${provider.priority})`);
     return provider.getManifest().pipe(
       map(manifest => {
           console.log(`Manifest from ${provider.name}: ${manifest?.rounds?.length || 0} rounds`,
             manifest?.rounds?.map(r => r.id));
        if (!manifest || !manifest.rounds) {
          console.warn(`ContentManager: No manifest or rounds from ${provider.name}`);
          return [];
        }

        console.log(`ContentManager: Processing ${manifest.rounds.length} rounds from ${provider.name}`);

        // Validate round metadata
        const validRounds = manifest.rounds.filter(round => {
          console.log(`ContentManager: Validating round ${round.id} from ${provider.name}`);
          const validation = this.validator.validateRoundMetadata(round);
          if (!validation.isValid) {
            console.warn(`ContentManager: Invalid round metadata from ${provider.name}:`, round.id, validation.errors);
            return false;
          }
          console.log(`ContentManager: Round ${round.id} is valid`);
          return true;
        });

        console.log(`ContentManager: ${validRounds.length} valid rounds from ${provider.name}`);
        return validRounds;
      }),
      catchError(error => {
        console.error(`ContentManager: Failed to get manifest from provider ${provider.name}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Check for content updates across all repositories
   */
  async checkForUpdates(): Promise<ContentUpdateInfo> {
    console.log('ContentManager: Checking for updates...');
    const currentRounds = await firstValueFrom(this.getAvailableRounds());
    const currentRoundIds = new Set(currentRounds.map(r => r.id));
    console.log('ContentManager: Current rounds:', currentRounds.map(r => r.id));
    console.log('ContentManager: Current round IDs set:', Array.from(currentRoundIds));

    // Check each repository for updates
    const repositories = await this.repositoryManager.getRepositories();
    console.log('ContentManager: Checking repositories:', repositories.map(r => `${r.id} (${r.enabled ? 'enabled' : 'disabled'})`));
    const newRounds: RoundMetadata[] = [];
    const updatedRounds: RoundMetadata[] = [];
    const freshRoundIds = new Set<string>();

    for (const repo of repositories.filter(r => r.enabled)) {
      console.log(`ContentManager: Checking updates for repo ${repo.id}`);
      try {
        const provider = this.repositoryManager.getProvider(repo.id);
        if (!provider) {
          console.warn(`ContentManager: No provider found for repo ${repo.id}`);
          continue;
        }

        console.log(`ContentManager: Getting manifest from provider ${provider.name} (${provider.constructor.name})`);
        console.log(`ContentManager: Provider priority: ${provider.priority}`);
        const manifest = await firstValueFrom(provider.getManifest());
        console.log(`Got manifest with ${manifest?.rounds?.length || 0} rounds`,
          manifest?.rounds?.map(r => r.id));
        if (!manifest?.rounds) {
          console.warn(`ContentManager: No rounds in manifest for repo ${repo.id}`);
          continue;
        }

        for (const round of manifest.rounds) {
          freshRoundIds.add(round.id);
          console.log(`ContentManager: Checking round ${round.id} from repo ${repo.id}`);
          if (!currentRoundIds.has(round.id)) {
            console.log(`ContentManager: Found new round ${round.id}`);
            newRounds.push(round);
          } else {
            // Check if updated (simplified - could compare timestamps)
            const current = currentRounds.find(r => r.id === round.id);
            if (current && round.lastModified !== current.lastModified) {
              console.log(`ContentManager: Found updated round ${round.id}`);
              updatedRounds.push(round);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to check updates for repository ${repo.id}:`, error);
      }
    }

    // Detect removed rounds
    const removedRoundIds = currentRounds.filter(r => !freshRoundIds.has(r.id)).map(r => r.id);
    console.log('ContentManager: Detected removed rounds:', removedRoundIds);

    const result = {
      hasUpdates: newRounds.length > 0 || updatedRounds.length > 0 || removedRoundIds.length > 0,
      newRounds,
      updatedRounds,
      removedRounds: removedRoundIds
    };
    console.log('ContentManager: Update check result:', result);
    return result;
  }

  /**
   * Update content by downloading from repositories
   */
  async updateContent(): Promise<void> {
    const updates = await this.checkForUpdates();

    // Download new rounds
    for (const round of updates.newRounds) {
      try {
        await this.loadRound(round.id);
      } catch (error) {
        console.warn(`Failed to download round ${round.id}:`, error);
      }
    }

    // Download updated rounds
    for (const round of updates.updatedRounds) {
      try {
        await this.loadRound(round.id);
      } catch (error) {
        console.warn(`Failed to update round ${round.id}:`, error);
      }
    }

    // Remove deleted rounds from cache
    for (const roundId of updates.removedRounds) {
      try {
        await this.cachedProvider.removeRound(roundId);
        console.log(`Removed round ${roundId} from cache`);
      } catch (error) {
        console.warn(`Failed to remove round ${roundId} from cache:`, error);
      }
    }

    // Validate and clean cached manifest
    await this.cachedProvider.validateAndCleanManifest();

    // Refresh the available rounds list to reflect changes
    this.loadAvailableRounds();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cachedProvider.getCacheStats();
  }

  /**
   * Update provider chain when repositories change
   */
  private updateProviderChain(): void {
    // Rebuild provider list with current repositories
    this.providers = [
      this.cachedProvider,
      this.localProvider
    ];

    // Add GitHub providers for enabled repositories
    // This would be called after repository changes
    // For now, initialize handles this
  }
}