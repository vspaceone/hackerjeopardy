import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseContentProvider } from './base-content.provider';
import { ContentManifest, GameRound, Category } from '../content.types';

@Injectable()
export class GitHubContentProvider extends BaseContentProvider {
  readonly name = 'GitHub';

  constructor(
    private http: HttpClient,
    private repoId: string,
    private githubUrl: string,
    readonly priority: number = 2
  ) {
    super();
  }

  private getPagesUrl(): string {
    const [owner, repo] = this.githubUrl.split('/');
    return `https://${owner}.github.io/${repo}`;
  }

  getManifest(): Observable<ContentManifest> {
    const url = `${this.getPagesUrl()}/manifest.json?t=${Date.now()}`;
    console.log(`GitHubContentProvider (${this.githubUrl}): Fetching manifest from ${url}`);
    return this.http.get<ContentManifest>(url).pipe(
      map(manifest => {
        console.log(`GitHubContentProvider (${this.githubUrl}): Raw manifest fetched with ${manifest?.rounds?.length || 0} rounds`);
        const processed = this.processManifest(manifest);
        console.log(`GitHubContentProvider (${this.githubUrl}): Processed manifest with ${processed?.rounds?.length || 0} rounds:`, processed?.rounds?.map(r => r.id));
        return processed;
      }),
      catchError(error => {
        console.error(`GitHubContentProvider (${this.githubUrl}): Failed to fetch manifest:`, error);
        return this.handleError(error);
      })
    );
  }

  getRound(roundId: string): Observable<GameRound> {
    // Remove repository prefix if present (for internal requests)
    const cleanRoundId = roundId.replace(`${this.repoId}_`, '');

    return this.http.get<GameRound>(`${this.getPagesUrl()}/rounds/${cleanRoundId}/round.json`).pipe(
      map(round => this.processRound(round)),
      catchError(this.handleError)
    );
  }

  getCategory(roundId: string, categoryName: string): Observable<Category> {
    // Remove repository prefix if present
    const cleanRoundId = roundId.replace(`${this.repoId}_`, '');
    const cleanCategoryName = categoryName.replace(`${this.repoId}_`, '');

    return this.http.get<Category>(`${this.getPagesUrl()}/rounds/${cleanRoundId}/${cleanCategoryName}/cat.json`).pipe(
      map(category => this.processCategory(category)),
      catchError(this.handleError)
    );
  }

  getImageUrl(roundId: string, categoryName: string, imageName: string): string {
    // If imageName is already a full URL, return it
    if (imageName.startsWith('http')) {
      return imageName;
    }

    // Only handle rounds that belong to this repository
    if (!roundId.startsWith(`${this.repoId}_`)) {
      return ''; // Not our repository, let next provider handle it
    }

    // Remove repository prefixes for URL construction
    const cleanRoundId = roundId.replace(`${this.repoId}_`, '');
    const cleanCategoryName = categoryName.replace(`${this.repoId}_`, '');

    return `${this.getPagesUrl()}/rounds/${cleanRoundId}/${cleanCategoryName}/${imageName}`;
  }

  override async isAvailable(): Promise<boolean> {
    try {
      // Try to fetch manifest to check if repository is available
      await firstValueFrom(this.http.get(`${this.getPagesUrl()}/manifest.json`));
      return true;
    } catch {
      return false;
    }
  }

  // Process manifest to add repository metadata and prefix round IDs
  private processManifest(manifest: ContentManifest): ContentManifest {
    console.log(`GitHubContentProvider (${this.githubUrl}): Processing manifest with ${manifest.rounds?.length || 0} rounds`);
    const processedRounds = manifest.rounds.map(round => {
      const processedRound = {
        ...round,
        id: `${this.repoId}_${round.id}`
      };
      console.log(`GitHubContentProvider: Processed round ${round.id} -> ${processedRound.id}`);
      return processedRound;
    });

    return {
      ...manifest,
      repository: {
        name: this.githubUrl,
        ...manifest.repository
      },
      rounds: processedRounds
    };
  }

  // Process round to prefix IDs
  private processRound(round: GameRound): GameRound {
    return {
      ...round,
      id: `${this.repoId}_${round.id}`,
      categories: round.categories.map(cat => `${this.repoId}_${cat}`)
    };
  }

  // Process category to prefix question references
  private processCategory(category: Category): Category {
    return {
      ...category,
      questions: category.questions.map(question => ({
        ...question,
        cat: `${this.repoId}_${question.cat}`
      }))
    };
  }

  // Get user-friendly display names (without prefixes)
  getDisplayRoundId(roundId: string): string {
    return roundId.replace(`${this.repoId}_`, '');
  }

  getDisplayCategoryName(categoryName: string): string {
    return categoryName.replace(`${this.repoId}_`, '');
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error: ${error.status} ${error.message}`;
    }

    console.error(`GitHubContentProvider (${this.githubUrl}) error: ${errorMessage}`);
    return throwError(() => new Error(`Failed to load content from ${this.githubUrl}: ${errorMessage}`));
  };
}