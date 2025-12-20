import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player, Question, Category } from '../models/game.models';
import { PLAYER_CONFIG, PLAYER_COLORS } from '../constants/game.constants';

/**
 * Centralized game state management service
 * Handles all game state and provides reactive streams for state changes
 */
@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  // State Subjects
  private playerCountSubject = new BehaviorSubject<number>(4); // Default to 4 for backward compatibility
  private playersSubject = new BehaviorSubject<Player[]>(this.createDefaultPlayers());
  private categoriesSubject = new BehaviorSubject<Category[] | null>(null);
  private selectedQuestionSubject = new BehaviorSubject<Question | null>(null);
  private currentRoundNameSubject = new BehaviorSubject<string>('');
  private couldBeCanceledSubject = new BehaviorSubject<boolean>(false);

  // Public Observables
  readonly playerCount$ = this.playerCountSubject.asObservable();
  readonly players$ = this.playersSubject.asObservable();
  readonly categories$ = this.categoriesSubject.asObservable();
  readonly selectedQuestion$ = this.selectedQuestionSubject.asObservable();
  readonly currentRoundName$ = this.currentRoundNameSubject.asObservable();
  readonly couldBeCanceled$ = this.couldBeCanceledSubject.asObservable();

  // Getters for current state (synchronous access)
  get playerCount(): number {
    return this.playerCountSubject.value;
  }

  get players(): Player[] {
    return this.playersSubject.value;
  }

  get categories(): Category[] | null {
    return this.categoriesSubject.value;
  }

  get selectedQuestion(): Question | null {
    return this.selectedQuestionSubject.value;
  }

  get currentRoundName(): string {
    return this.currentRoundNameSubject.value;
  }

  get couldBeCanceled(): boolean {
    return this.couldBeCanceledSubject.value;
  }

  /**
    * Create default players with initial state
    */
  private createDefaultPlayers(count: number = this.playerCount, idOffset: number = 0): Player[] {
    return PLAYER_COLORS.slice(idOffset, idOffset + count).map(color => ({
      id: color.id,
      btn: color.btn,
      name: color.btn,
      score: PLAYER_CONFIG.INITIAL_SCORE,
      bgcolor: color.bgcolor,
      fgcolor: color.fgcolor,
      key: color.key,
      remainingtime: null,
      highlighted: false,
      selectionBuzzes: 0
    }));
  }

  /**
    * Set the number of players
    */
  setPlayerCount(count: number): void {
    if (count < 1 || count > 8) return; // Enforce limits

    const oldCount = this.playerCount;
    const oldPlayers = [...this.players];

    this.playerCountSubject.next(count);

    if (!this.categories) {
      // No round active - safe to reset everything
      this.playersSubject.next(this.createDefaultPlayers(count));
      this.resetToRoundSelection();
    } else {
      // Round is active - preserve existing player stats
      const newPlayers = [];

      // Keep existing players (up to the new count)
      for (let i = 0; i < Math.min(oldCount, count); i++) {
        newPlayers.push(oldPlayers[i]);
      }

      // Add new players if increasing count
      if (count > oldCount) {
        const additionalPlayers = this.createDefaultPlayers(count - oldCount, oldCount);
        newPlayers.push(...additionalPlayers);
      }

      // Update players (removing excess players if decreasing)
      this.playersSubject.next(newPlayers.slice(0, count));

      // Handle active questions
      if (this.selectedQuestion) {
        // If question is active, we need to update availablePlayers
        // Remove players who are no longer in the game from availablePlayers
        const currentPlayerIds = new Set(this.players.map(p => p.id));
        this.selectedQuestion.availablePlayers =
          new Set([...this.selectedQuestion.availablePlayers].filter(id => currentPlayerIds.has(id)));

        // If active player was removed, clear the active state
        if (this.selectedQuestion.activePlayer &&
            !currentPlayerIds.has(this.selectedQuestion.activePlayer.id)) {
          this.selectedQuestion.activePlayer = undefined;
          this.selectedQuestion.activePlayers.clear();
          this.selectedQuestion.activePlayersArr = [];
        }
      }
    }
  }

  /**
    * Load a new round
    */
  loadRound(roundName: string, categories: Category[]): void {
    this.currentRoundNameSubject.next(roundName);
    this.categoriesSubject.next(categories);
    this.selectedQuestionSubject.next(null);
    this.couldBeCanceledSubject.next(false);
  }

  /**
   * Select a question
   */
  selectQuestion(question: Question): void {
    this.selectedQuestionSubject.next(question);
    this.couldBeCanceledSubject.next(true);
  }

  /**
   * Close the current question
   */
  closeQuestion(): void {
    this.selectedQuestionSubject.next(null);
    this.couldBeCanceledSubject.next(false);
  }



  /**
   * Mark question as answered (correct or incorrect)
   */
  markQuestionAnswered(): void {
    this.couldBeCanceledSubject.next(false);
  }

  /**
   * Reset to round selection
   */
  resetToRoundSelection(): void {
    this.categoriesSubject.next(null);
    this.selectedQuestionSubject.next(null);
    this.couldBeCanceledSubject.next(false);
    this.currentRoundNameSubject.next('');
  }

  /**
   * Get a player by ID
   */
  getPlayerById(playerId: number): Player | undefined {
    return this.players.find(p => p.id === playerId);
  }

  /**
   * Update a player's score
   */
  updatePlayerScore(playerId: number, amount: number): void {
    const player = this.getPlayerById(playerId);
    if (player) {
      player.score += amount;
      this.playersSubject.next([...this.players]); // Trigger update
    }
  }

  /**
   * Highlight a player temporarily
   */
  highlightPlayer(playerId: number, duration: number = 3000): void {
    const player = this.getPlayerById(playerId);
    if (player) {
      player.highlighted = true;
      player.selectionBuzzes = (player.selectionBuzzes || 0) + 1;
      this.playersSubject.next([...this.players]);

      setTimeout(() => {
        player.highlighted = false;
        this.playersSubject.next([...this.players]);
      }, duration);
    }
  }

  /**
   * Reset all player scores
   */
  resetAllScores(): void {
    this.players.forEach(player => {
      player.score = PLAYER_CONFIG.INITIAL_SCORE;
      player.selectionBuzzes = 0;
    });
    this.playersSubject.next([...this.players]);
  }

  /**
   * Reset player selection buzzes
   */
  resetSelectionBuzzes(): void {
    this.players.forEach(player => {
      player.selectionBuzzes = 0;
    });
    this.playersSubject.next([...this.players]);
  }

  /**
   * Get current game state as a snapshot
   */
  getStateSnapshot() {
    return {
      players: [...this.players],
      categories: this.categories ? [...this.categories] : null,
      selectedQuestion: this.selectedQuestion,
      currentRoundName: this.currentRoundName,
      couldBeCanceled: this.couldBeCanceled
    };
  }
}
