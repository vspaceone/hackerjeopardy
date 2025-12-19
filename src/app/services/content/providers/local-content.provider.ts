import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseContentProvider } from './base-content.provider';
import { ContentManifest, GameRound, Category } from '../content.types';

@Injectable({
  providedIn: 'root'
})
export class LocalContentProvider extends BaseContentProvider {
  readonly name = 'Local';
  readonly priority = 3; // Lowest priority - fallback only

  private baseUrl = '/assets'; // In production this works, in dev it might need adjustment

  constructor(private http: HttpClient) {
    super();
  }

  getManifest(): Observable<ContentManifest> {
    // Use the existing rounds-manifest.json as fallback
    console.log(`LocalContentProvider: Loading manifest from ${this.baseUrl}/rounds-manifest.json`);
    return this.http.get<ContentManifest>(`${this.baseUrl}/rounds-manifest.json`).pipe(
      map(manifest => {
        console.log('LocalContentProvider: Loaded manifest with', manifest.rounds?.length || 0, 'rounds');
        return manifest;
      }),
      catchError(error => {
        console.error('LocalContentProvider: Failed to load manifest from', `${this.baseUrl}/rounds-manifest.json`, error);
        // Try alternative path
        console.log('LocalContentProvider: Trying alternative path /rounds-manifest.json');
        return this.http.get<ContentManifest>('/rounds-manifest.json').pipe(
          map(manifest => {
            console.log('LocalContentProvider: Loaded manifest from alternative path with', manifest.rounds?.length || 0, 'rounds');
            return manifest;
          }),
          catchError(error2 => {
            console.error('LocalContentProvider: Failed to load manifest from alternative path:', error2);
            return of({
              rounds: [],
              lastUpdated: new Date().toISOString(),
              totalRounds: 0,
              totalSize: 0,
              version: 'bundled'
            });
          })
        );
      })
    );
  }

  getRound(roundId: string): Observable<GameRound> {
    const encodedRoundId = encodeURIComponent(roundId);
    const url = `${this.baseUrl}/${encodedRoundId}/round.json`;
    console.log(`LocalContentProvider: Loading round from ${url}`);
    return this.http.get<GameRound>(url).pipe(
      map(round => {
        console.log('LocalContentProvider: Loaded round:', round);
        return round;
      }),
      catchError(error => {
        console.error(`LocalContentProvider: Failed to load ${url}:`, error);
        throw error;
      })
    );
  }

  getCategory(roundId: string, categoryName: string): Observable<Category> {
    // URL-encode category names for proper URL handling
    const encodedCategoryName = encodeURIComponent(categoryName);
    const url = `${this.baseUrl}/${roundId}/${encodedCategoryName}/cat.json`;
    console.log(`LocalContentProvider: Loading category from ${url}`);
    return this.http.get<Category>(url).pipe(
      catchError(error => {
        console.error(`LocalContentProvider: Failed to load ${url}:`, error);
        throw error;
      })
    );
  }

  getImageUrl(roundId: string, categoryName: string, imageName: string): string {
    // If imageName is already a full URL, return it
    if (imageName.startsWith('http') || imageName.startsWith('/')) {
      return imageName;
    }

    // Clean category names to match folder names (remove special chars)
    const cleanCategoryName = categoryName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const encodedImageName = encodeURIComponent(imageName);
    return `${this.baseUrl}/${roundId}/${cleanCategoryName}/${encodedImageName}`;
  }

  private convertLegacyManifest(legacyManifest: any): ContentManifest {
    // Convert the existing rounds-manifest.json format to new ContentManifest format
    const rounds = legacyManifest.rounds.map((round: any) => ({
      id: round.id,
      name: round.name,
      language: round.language,
      difficulty: round.difficulty,
      categories: [], // Will be populated when round is loaded
      author: round.author,
      lastModified: new Date().toISOString(), // Fallback
      size: 0, // Unknown for bundled content
      description: round.description,
      tags: round.tags
    }));

    return {
      rounds,
      lastUpdated: new Date().toISOString(),
      totalRounds: rounds.length,
      totalSize: 0, // Unknown for bundled content
      version: 'bundled'
    };
  }
}