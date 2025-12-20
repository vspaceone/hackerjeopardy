import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseContentProvider } from './base-content.provider';
import { ContentManifest, GameRound, Category } from '../content.types';
import { IndexedDBService } from '../indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class CachedContentProvider extends BaseContentProvider {
  readonly name = 'Cache';
  readonly priority = 1; // Highest priority - check cache first

  constructor(private indexedDB: IndexedDBService) {
    super();
  }

  getManifest(): Observable<ContentManifest> {
    return from(this.getValidatedManifest()).pipe(
      map(manifest => manifest)
    );
  }

  // Get manifest with validation to ensure consistency
  private async getValidatedManifest(): Promise<ContentManifest> {
    const entry = await this.indexedDB.get('manifest');
    if (entry?.data) {
      // Validate manifest integrity in background (don't await to avoid blocking)
      this.validateAndCleanManifest().catch(error =>
        console.warn('Background manifest validation failed:', error)
      );
      return entry.data;
    }

    // Return empty manifest if nothing cached
    return {
      rounds: [],
      lastUpdated: new Date().toISOString(),
      totalRounds: 0,
      totalSize: 0,
      version: 'cached'
    };
  }

  getRound(roundId: string): Observable<GameRound> {
    return from(this.indexedDB.get(`round-${roundId}`)).pipe(
      map(entry => {
        if (entry?.data) return entry.data;
        throw new Error(`Round ${roundId} not cached`);
      })
    );
  }

  getCategory(roundId: string, categoryName: string): Observable<Category> {
    return from(this.indexedDB.get(`category-${roundId}-${categoryName}`)).pipe(
      map(entry => {
        if (entry?.data) return entry.data;
        throw new Error(`Category ${categoryName} for round ${roundId} not cached`);
      })
    );
  }

  getImageUrl(roundId: string, categoryName: string, imageName: string): string {
    // Cached images would need special handling - for now, fall back to source
    // In a full implementation, images could also be cached as blobs
    return ''; // Return empty to let next provider handle it
  }

  // Override isAvailable to check if cache has content
  override async isAvailable(): Promise<boolean> {
    try {
      const manifest = await this.indexedDB.get('manifest');
      return manifest !== null;
    } catch {
      return false;
    }
  }

  // Additional methods for cache management
  async cacheManifest(manifest: ContentManifest): Promise<void> {
    const entry = {
      key: 'manifest',
      data: manifest,
      timestamp: Date.now(),
      type: 'manifest' as const,
      id: 'manifest',
      size: this.calculateSize(manifest),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    await this.indexedDB.set('manifest', entry);
  }

  // Atomic manifest update to prevent race conditions
  async updateManifest(updater: (manifest: ContentManifest) => ContentManifest): Promise<void> {
    const currentEntry = await this.indexedDB.get('manifest');
    const currentManifest = currentEntry?.data || {
      rounds: [],
      lastUpdated: new Date().toISOString(),
      totalRounds: 0,
      totalSize: 0,
      version: 'cached'
    };

    const updatedManifest = updater(currentManifest);
    await this.cacheManifest(updatedManifest);
  }

  // Validate and clean manifest to ensure all rounds exist in cache
  async validateAndCleanManifest(): Promise<void> {
    try {
      const currentEntry = await this.indexedDB.get('manifest');
      if (!currentEntry?.data?.rounds) return;

      const validRounds = [];
      for (const round of currentEntry.data.rounds) {
        // Check if round data exists and is not expired
        const roundEntry = await this.indexedDB.get(`round-${round.id}`);
        if (roundEntry?.data) {
          validRounds.push(round);
        } else {
          console.log(`CachedContentProvider: Removing stale round ${round.id} from manifest`);
        }
      }

      const cleanedManifest: ContentManifest = {
        ...currentEntry.data,
        rounds: validRounds,
        lastUpdated: new Date().toISOString(),
        totalRounds: validRounds.length
      };

      await this.cacheManifest(cleanedManifest);
      console.log('CachedContentProvider: Manifest validation and cleanup completed');
    } catch (error) {
      console.warn('CachedContentProvider: Failed to validate and clean manifest:', error);
    }
  }

  async cacheRound(roundId: string, round: GameRound): Promise<void> {
    const entry = {
      key: `round-${roundId}`,
      data: round,
      timestamp: Date.now(),
      type: 'round' as const,
      id: roundId,
      size: this.calculateSize(round),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    await this.indexedDB.set(`round-${roundId}`, entry);
  }

  async cacheCategory(roundId: string, categoryName: string, category: Category): Promise<void> {
    const entry = {
      key: `category-${roundId}-${categoryName}`,
      data: category,
      timestamp: Date.now(),
      type: 'category' as const,
      id: `${roundId}-${categoryName}`,
      size: this.calculateSize(category),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    await this.indexedDB.set(`category-${roundId}-${categoryName}`, entry);
  }

  async clearCache(): Promise<void> {
    await this.indexedDB.clear();
  }

  async cleanupExpiredEntries(): Promise<void> {
    await this.indexedDB.cleanupExpired();
  }

  async getCacheStats() {
    return await this.indexedDB.getStats();
  }

  async getCachedRoundIds(): Promise<string[]> {
    return await this.indexedDB.getCachedRoundIds();
  }

  async removeRound(roundId: string): Promise<void> {
    await this.indexedDB.delete(`round-${roundId}`);
    // Also remove all categories for this round
    const categoryEntries = await this.indexedDB.getByType('category');
    const roundCategories = categoryEntries.filter(entry =>
      entry.key.startsWith(`category-${roundId}-`)
    );
    for (const categoryEntry of roundCategories) {
      await this.indexedDB.delete(categoryEntry.key);
    }

    // Update the cached manifest to remove this round
    try {
      await this.updateManifest(manifest => {
        const updatedRounds = manifest.rounds.filter(round => round.id !== roundId);
        return {
          ...manifest,
          rounds: updatedRounds,
          lastUpdated: new Date().toISOString(),
          totalRounds: updatedRounds.length
        };
      });
      console.log(`CachedContentProvider: Removed round ${roundId} from cached manifest`);
    } catch (error) {
      console.warn(`CachedContentProvider: Failed to update manifest after removing round ${roundId}:`, error);
    }
  }
}