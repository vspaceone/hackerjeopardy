import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
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
  ContentUpdateInfo
} from './content.types';

@Injectable({
  providedIn: 'root'
})
export class ContentManagerService {
  private providers: ContentProvider[] = [];

  constructor(
    private repositoryManager: RepositoryManagerService,
    private cachedProvider: CachedContentProvider,
    private localProvider: LocalContentProvider,
    private validator: ContentValidatorService
  ) {}

  async initialize(): Promise<void> {
    await this.repositoryManager.initialize();

    // Set up provider chain
    this.providers = [
      this.cachedProvider, // Highest priority - check cache first
      // GitHub providers will be added dynamically below
      this.localProvider   // Lowest priority - bundled fallback
    ];

    console.log('ContentManagerService: Initial providers:', this.providers.map(p => p.name));

    // Add GitHub providers for enabled repositories
    const repositories = await this.repositoryManager.getRepositories();
    console.log('ContentManagerService: Found repositories:', repositories.length);

    for (const repo of repositories.filter(r => r.enabled)) {
      console.log('ContentManagerService: Adding GitHub provider for:', repo.id);
      const provider = this.repositoryManager.getProvider(repo.id);
      if (provider) {
        this.providers.push(provider);
      }
    }

    console.log('ContentManagerService: Final providers:', this.providers.map(p => `${p.name} (priority: ${p.priority})`));
  }

  /**
   * Get all available rounds from all enabled repositories
   */
  getAvailableRounds(): Observable<RoundMetadata[]> {
    return combineLatest(
      this.providers.map(provider => this.getRoundsFromProvider(provider))
    ).pipe(
      map(roundsArrays => {
        // Flatten and remove duplicates (prefer higher priority providers)
        const allRounds = roundsArrays.flat();
        const roundMap = new Map<string, RoundMetadata>();

        allRounds.forEach(round => {
          if (!roundMap.has(round.id)) {
            roundMap.set(round.id, round);
          }
        });

        return Array.from(roundMap.values());
      })
    );
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
    console.log(`ContentManagerService: Available providers:`, this.providers.map(p => p.name));

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
    return provider.getManifest().pipe(
      map(manifest => {
        if (!manifest || !manifest.rounds) return [];

        // Validate round metadata
        return manifest.rounds.filter(round => {
          const validation = this.validator.validateRoundMetadata(round);
          if (!validation.isValid) {
            console.warn(`Invalid round metadata from ${provider.name}:`, round.id, validation.errors);
            return false;
          }
          return true;
        });
      }),
      catchError(error => {
        console.warn(`Failed to get manifest from provider ${provider.name}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Check for content updates across all repositories
   */
  async checkForUpdates(): Promise<ContentUpdateInfo> {
    const currentRounds = await firstValueFrom(this.getAvailableRounds());
    const currentRoundIds = new Set(currentRounds.map(r => r.id));

    // Check each repository for updates
    const repositories = await this.repositoryManager.getRepositories();
    const newRounds: RoundMetadata[] = [];
    const updatedRounds: RoundMetadata[] = [];

    for (const repo of repositories.filter(r => r.enabled)) {
      try {
        const provider = this.repositoryManager.getProvider(repo.id);
        if (!provider) continue;

        const manifest = await firstValueFrom(provider.getManifest());
        if (!manifest?.rounds) continue;

        for (const round of manifest.rounds) {
          const prefixedId = `${repo.id}_${round.id}`;
          if (!currentRoundIds.has(prefixedId)) {
            newRounds.push({ ...round, id: prefixedId });
          } else {
            // Check if updated (simplified - could compare timestamps)
            const current = currentRounds.find(r => r.id === prefixedId);
            if (current && round.lastModified !== current.lastModified) {
              updatedRounds.push({ ...round, id: prefixedId });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to check updates for repository ${repo.id}:`, error);
      }
    }

    return {
      hasUpdates: newRounds.length > 0 || updatedRounds.length > 0,
      newRounds,
      updatedRounds,
      removedRounds: [] // Not implemented yet
    };
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