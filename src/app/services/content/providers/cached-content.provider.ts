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
    return from(this.indexedDB.get('manifest')).pipe(
      map(entry => {
        if (entry?.data) return entry.data;
        // Return empty manifest if nothing cached
        return {
          rounds: [],
          lastUpdated: new Date().toISOString(),
          totalRounds: 0,
          totalSize: 0,
          version: 'cached'
        };
      })
    );
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
  }
}