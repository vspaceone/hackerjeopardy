import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseContentProvider } from './base-content.provider';
import { ContentManifest, GameRound, Category } from '../content.types';

@Injectable({
  providedIn: 'root'
})
export class LocalContentProvider extends BaseContentProvider {
  readonly name = 'Local';
  readonly priority = 3; // Lowest priority - fallback only

  private baseUrl = '/assets';

  constructor(private http: HttpClient) {
    super();
  }

  getManifest(): Observable<ContentManifest> {
    // Use the existing rounds-manifest.json as fallback
    return this.http.get<any>(`${this.baseUrl}/rounds-manifest.json`).pipe(
      map(legacyManifest => this.convertLegacyManifest(legacyManifest))
    );
  }

  getRound(roundId: string): Observable<GameRound> {
    const url = `${this.baseUrl}/${roundId}/round.json`;
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
    // Don't URL-encode category names for local file system access
    const url = `${this.baseUrl}/${roundId}/${categoryName}/cat.json`;
    console.log(`LocalContentProvider: Loading category from ${url}`);
    return this.http.get<Category>(url).pipe(
      catchError(error => {
        console.error(`LocalContentProvider: Failed to load ${url}:`, error);
        throw error;
      })
    );
  }

  getImageUrl(roundId: string, categoryName: string, imageName: string): string {
    // Don't URL-encode category names for local file system access
    return `${this.baseUrl}/${roundId}/${categoryName}/${imageName}`;
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