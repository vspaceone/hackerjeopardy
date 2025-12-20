import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Category, Question } from '../models/game.models';
import { RoundMetadata } from './content/content.types';
import { ContentManagerService } from './content/content-manager.service';
import { QUESTION_VALUES, PLAYER_CONFIG } from '../constants/game.constants';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  constructor(
    private contentManager: ContentManagerService,
    private http: HttpClient
  ) {}

  /**
   * Get available round IDs (for backward compatibility)
   */
  getAvailableSets(useVspace: boolean = false): Observable<string[]> {
    return this.contentManager.getAvailableRounds().pipe(
      map(rounds => rounds.map(round => round.id)),
      catchError(() => {
        // Fallback to empty array if content loading fails
        return from([]);
      })
    );
  }

  /**
   * Get detailed round metadata
   */
  getAvailableRounds(): Observable<RoundMetadata[]> {
    return this.contentManager.getAvailableRounds();
  }

  /**
   * Load a complete game round with all categories
   */
  loadGameRound(setName: string): Observable<Category[]> {
    // Try content manager first, fall back to direct loading if it fails
    return from(this.contentManager.loadRound(setName)).pipe(
      switchMap(roundData => {
        // Convert category loading promises to observables
        const categoryRequests = roundData.categories.map(categoryName =>
          from(this.contentManager.loadCategory(setName, categoryName))
        );
        return forkJoin(categoryRequests).pipe(
          map((categories: Category[]) => this.processCategories(categories, setName))
        );
      }),
      catchError(error => {
        console.warn(`ContentManager failed for ${setName}, trying direct load:`, error);
        // Fallback: Load directly from assets
        return this.loadGameRoundDirect(setName);
      })
    );
  }

  private loadGameRoundDirect(setName: string): Observable<Category[]> {
    // Direct loading from assets as fallback
    return this.http.get<{categories: string[]}>(`/assets/${setName}/round.json`).pipe(
      switchMap(roundData => {
        const categoryRequests = roundData.categories.map((categoryName: string) =>
          this.http.get<Category>(`/assets/${setName}/${categoryName}/cat.json`)
        );
        return forkJoin(categoryRequests).pipe(
          map((categories: Category[]) => this.processCategories(categories, setName))
        );
      })
    );
  }

  /**
   * Process categories to initialize game state
   */
  private processCategories(categories: Category[], setName: string): Category[] {
    return categories.map(category => {
      const processedQuestions = category.questions.map((question, qIdx) => {
        const processedQuestion: Question = {
          ...question,
          available: true,
          value: (qIdx + 1) * QUESTION_VALUES.BASE_MULTIPLIER,
          cat: category.name,
          folder: category.path || category.name, // Use path for folder, fallback to name
          roundId: setName, // Add round ID
          activePlayers: new Set<number>(),
          activePlayersArr: [],
          timeoutPlayers: new Set<number>(),
          timeoutPlayersArr: [],
          availablePlayers: new Set<number>(
            Array.from({ length: PLAYER_CONFIG.COUNT }, (_, i) => i + 1)
          ),
          buttonsActive: false,
          // Initialize queuing system
          buzzQueue: [],
          currentQueueIndex: 0,
          queueResolved: false
        };

        // Keep original image paths - URLs will be resolved when displaying
        processedQuestion.image = question.image;

        return processedQuestion;
      });

      return {
        ...category,
        questions: processedQuestions
      };
    });
  }

  /**
   * Get content manager for advanced operations
   */
  getContentManager(): ContentManagerService {
    return this.contentManager;
  }
}