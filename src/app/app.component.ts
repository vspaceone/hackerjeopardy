import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { GameDataService } from './services/game-data.service';
import { GameService } from './services/game.service';
import { GameStateService } from './services/game-state.service';
import { AudioService } from './services/audio.service';
import { ContentManagerService } from './services/content/content-manager.service';
import { ControllerService } from './services/controller.service';
import { SetSelectionComponent } from './components/set-selection/set-selection.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { QuestionDisplayComponent } from './components/question-display/question-display.component';
import { PlayerControlsComponent } from './components/player-controls/player-controls.component';
import { ContentManagerComponent } from './components/content-manager/content-manager.component';
import { Category, Player, Question } from './models/game.models';
import { RoundMetadata } from './services/content/content.types';
import { KEYBOARD, TIMING, PLAYER_CONFIG, MATRIX_RAIN } from './constants/game.constants';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		SetSelectionComponent,
		GameBoardComponent,
		QuestionDisplayComponent,
		PlayerControlsComponent,
		ContentManagerComponent
	]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	title = 'Hacker Jeopardy';
	availableRounds: RoundMetadata[] = [];
  loading = true;
  showContentManager = false;
  hasControllers = false;

  // State from GameStateService
  playerCount = 4;
  players: Player[] = [];
  qanda: Category[] | null = null;
  selectedQuestion: Question | null = null;
  currentRoundName = '';
  couldBeCanceled = false;

  // Long press handling
  private longPressTimer: number | null = null;
  private longPressAction = '';
  private destroy$ = new Subject<void>();

  // Reveal trigger for keyboard shortcut
  revealTrigger = false;
  // Force reveal answer when all players answer incorrectly
  forceRevealAnswer = false;
  // Track if any player is currently being renamed
  isAnyPlayerRenaming = false;
  // Current question selector
  currentSelector: Player | null = null;

	constructor(
		private gameDataService: GameDataService,
		private gameService: GameService,
		private gameStateService: GameStateService,
		private audioService: AudioService,
		private contentManager: ContentManagerService,
		private controllerService: ControllerService
	) { }

  async ngOnInit(): Promise<void> {
    try {
      console.log('AppComponent: Starting initialization...');
      
      // Initialize content manager
      console.log('AppComponent: Initializing content manager...');
      await this.contentManager.initialize();
      console.log('AppComponent: Content manager initialized');

			// Subscribe to game state changes
			this.subscribeToGameState();

			// Load available rounds
			console.log('AppComponent: Loading available rounds...');
			this.gameDataService.getAvailableRounds()
				.pipe(takeUntil(this.destroy$))
				.subscribe({
				next: (rounds) => {
					console.log('AppComponent: Loaded rounds:', rounds.length);
					rounds.forEach(round => {
						console.log(`  - ${round.name} (${round.id}) - ${round.categories?.length || 0} categories`);
					});
					this.availableRounds = rounds;
					this.loading = false;
				},
				error: (error) => {
					console.error('AppComponent: Failed to load available rounds:', error);
					this.availableRounds = [];
					this.loading = false;
				}
			});

			// Subscribe to controller activations
			this.controllerService.playerActivated$
				.pipe(takeUntil(this.destroy$))
				.subscribe(playerId => {
					this.handlePlayerActivation(playerId);
				});

			// Subscribe to controller detection
			this.controllerService.connectedControllers$
				.pipe(takeUntil(this.destroy$))
				.subscribe(controllers => {
					this.hasControllers = controllers.length > 0;
				});
    } catch (error) {
      console.error('AppComponent: Failed to initialize content manager:', error);
      this.loading = false;
    }
  }

	ngAfterViewInit(): void {
		this.initMatrixRain();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Subscribe to game state changes from GameStateService
	 */
	private subscribeToGameState(): void {
		this.gameStateService.playerCount$
			.pipe(takeUntil(this.destroy$))
			.subscribe(count => this.playerCount = count);

		this.gameStateService.players$
			.pipe(takeUntil(this.destroy$))
			.subscribe(players => this.players = players);

		this.gameStateService.categories$
			.pipe(takeUntil(this.destroy$))
			.subscribe(categories => this.qanda = categories);

		this.gameStateService.selectedQuestion$
			.pipe(takeUntil(this.destroy$))
			.subscribe(question => this.selectedQuestion = question);

		this.gameStateService.currentRoundName$
			.pipe(takeUntil(this.destroy$))
			.subscribe(name => this.currentRoundName = name);

		this.gameStateService.couldBeCanceled$
			.pipe(takeUntil(this.destroy$))
			.subscribe(value => this.couldBeCanceled = value);

		this.gameStateService.currentSelector$
			.pipe(takeUntil(this.destroy$))
			.subscribe(selector => this.currentSelector = selector);
	}

	/**
	 * Handle keyboard input for player buzzing and host controls
	 */
  onPlayerRenamingStateChange(isRenaming: boolean): void {
    this.isAnyPlayerRenaming = isRenaming;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Disable keyboard shortcuts when any input element is focused (for player renaming, etc.)
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    // Disable keyboard shortcuts when any player is being renamed
    if (this.isAnyPlayerRenaming) return;

    // Allow input when round is loaded (for player buzzing) or question is selected (for host controls)
    if (!this.qanda) return;

		// Handle host controls (available anytime during a round)
		const hostAction = this.getHostActionFromKey(event.key, event.altKey, event.shiftKey);
		if (hostAction) {
			event.preventDefault();
			this.handleHostAction(hostAction);
			return;
		}

		// Handle player activation (during question selection or answering)
		const playerId = this.getPlayerIdFromKey(event.key);
		if (playerId) {
			event.preventDefault();
			this.handlePlayerActivation(playerId);
		}
	}

	/**
	 * Map keyboard key to player ID
	 */
	private getPlayerIdFromKey(key: string): number | null {
		let playerId: number | null = null;

		// Direct player keys
		if ((KEYBOARD.PLAYER_KEYS as readonly string[]).includes(key)) {
			playerId = parseInt(key);
		}

		// Special/international key mappings
		if (key in KEYBOARD.KEY_MAPPINGS) {
			const mappedKey = KEYBOARD.KEY_MAPPINGS[key as keyof typeof KEYBOARD.KEY_MAPPINGS];
			playerId = parseInt(mappedKey);
		}

		// Only allow activation if player exists
		if (playerId && playerId <= this.playerCount) {
			return playerId;
		}

		return null;
	}

	/**
	 * Map keyboard key to host action
	 */
	private getHostActionFromKey(key: string, altKey: boolean, shiftKey?: boolean): string | null {
		const { HOST_KEYS } = KEYBOARD;

		// Host actions that don't require modifiers
		const standardActions: Record<string, string> = {
			[HOST_KEYS.CORRECT]: 'correct',
			[HOST_KEYS.INCORRECT]: 'incorrect',
			[HOST_KEYS.REVEAL]: 'reveal',
			[HOST_KEYS.CLOSE]: 'close',
			[HOST_KEYS.NO_ONE_KNOWS]: 'noOneKnows'
		};

		if (standardActions[key]) {
			return standardActions[key];
		}

		// Host actions that require Shift (detected by uppercase key)
		const shiftActions: Record<string, string> = {
			[HOST_KEYS.RESET_SCORES]: 'resetScores', // 'S'
			[HOST_KEYS.RESET_ROUND]: 'resetRound'     // 'Q'
		};

		if (shiftActions[key]) {
			return shiftActions[key];
		}

		return null;
	}

	/**
	 * Handle host control actions
	 */
	private handleHostAction(action: string): void {
		switch (action) {
			case 'correct':
				// Only allow when there's an active player answering
				if (this.selectedQuestion?.activePlayer) {
					this.correct();
				}
				break;
			case 'incorrect':
				// Only allow when there's an active player answering
				if (this.selectedQuestion?.activePlayer) {
					this.incorrect();
				}
				break;
			case 'reveal':
				this.revealTrigger = !this.revealTrigger; // Toggle to trigger the input
				break;
			case 'close':
				this.close();
				break;
			case 'noOneKnows':
				this.noOneKnows();
				break;
			case 'resetScores':
				this.resetAllScoresKeyboard();
				break;
			case 'resetRound':
				this.backToRoundSelection();
				break;
		}
	}

	/**
	 * Handle player activation (buzzing in)
	 */
	private handlePlayerActivation(playerId: number): void {
		// Check if player exists
		const player = this.players.find(p => p.id === playerId);
		if (!player) return;

		const buzzerPlayerId = Math.max(1, Math.min(8, playerId)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

		if (this.selectedQuestion) {
			// Question is open - attempt to buzz in for answering
			this.handleBuzzDuringQuestion(playerId, buzzerPlayerId);
		} else {
			// Question selection mode - highlight player for identification
			this.handleBuzzDuringSelection(playerId, buzzerPlayerId);
		}
	}

	/**
	 * Handle buzzing during an open question
	 */
	private handleBuzzDuringQuestion(playerId: number, buzzerPlayerId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void {
		if (!this.selectedQuestion) return;

		const activated = this.gameService.activatePlayer(this.selectedQuestion, playerId, this.players);
		if (activated) {
			this.audioService.playBuzzer(buzzerPlayerId);
			this.gameStateService.markQuestionAnswered();
		}
	}

	/**
	 * Handle buzzing during question selection (for player identification)
	 */
	private handleBuzzDuringSelection(playerId: number, buzzerPlayerId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void {
		this.gameStateService.highlightPlayer(playerId, TIMING.PLAYER_HIGHLIGHT_DURATION);
		this.audioService.playBuzzer(buzzerPlayerId);

		// Punish excessive buzzing during selection
		const player = this.gameStateService.getPlayerById(playerId);
		if (player && (player.selectionBuzzes || 0) > PLAYER_CONFIG.MAX_SELECTION_BUZZES) {
			this.gameStateService.updatePlayerScore(playerId, -1);
		}
	}

	/**
	 * Initialize Matrix rain background effect
	 */
	private initMatrixRain(): void {
		const canvas = document.getElementById('matrixRain') as HTMLCanvasElement;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const matrixArray = MATRIX_RAIN.CHARACTERS.split('');
		const fontSize = MATRIX_RAIN.FONT_SIZE;
		const columns = canvas.width / fontSize;
		const drops: number[] = [];

		for (let x = 0; x < columns; x++) {
			drops[x] = 1;
		}

		const draw = () => {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#00ff88';
			ctx.font = fontSize + 'px monospace';

			for (let i = 0; i < drops.length; i++) {
				const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
				ctx.fillText(text, i * fontSize, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i]++;
			}
		};

		setInterval(draw, TIMING.MATRIX_RAIN_INTERVAL);
	}

  /**
   * Load a game round
   */
  selectSet(roundId: string): void {
    this.audioService.playClick();
    this.gameDataService.loadGameRound(roundId).subscribe({
      next: (categories) => {
        this.gameStateService.loadRound(roundId, categories);
      },
      error: (error) => {
        console.error('Error loading round:', roundId, error);
        alert(`Failed to load round "${roundId}": ${error.message}`);
      }
    });
  }

	/**
	 * Reset a question to its initial state
	 */
	resetQuestion(question: Question): void {
		this.gameService.resetQuestion(question, this.players);
		// Close modal if this question was selected
		if (this.selectedQuestion === question) {
			this.gameStateService.closeQuestion();
		}
	}

	/**
	 * Return to round selection
	 */
	backToRoundSelection(): void {
		this.gameStateService.resetToRoundSelection();
		this.showContentManager = false;
		this.audioService.stopThemeMusic();
	}

	/**
	 * Select a question
	 */
	onSelect(question: Question): void {
		this.gameStateService.selectQuestion(question);
		this.audioService.playClick();
		this.audioService.startThemeMusic();
	}

	/**
	 * Increase player count
	 */
	increasePlayerCount(): void {
		if (this.playerCount < 8) {
			this.gameStateService.setPlayerCount(this.playerCount + 1);
		}
	}

	/**
	 * Decrease player count
	 */
	decreasePlayerCount(): void {
		if (this.playerCount > 1) {
			this.gameStateService.setPlayerCount(this.playerCount - 1);
		}
	}

	/**
	 * Mark question as correctly answered
	 */
	correct(): void {
		this.audioService.stopThemeMusic();
		if (this.selectedQuestion) {
			this.gameService.correctAnswer(this.selectedQuestion);
			// Set the correct answerer as the next question selector
			if (this.selectedQuestion.player) {
				this.gameStateService.setQuestionSelector(this.selectedQuestion.player);
			}
		}
		this.gameStateService.markQuestionAnswered();
	}

	/**
	 * Mark question as incorrectly answered
	 */
	incorrect(): void {
		this.audioService.stopThemeMusic();
		if (this.selectedQuestion) {
			this.gameService.incorrectAnswer(this.selectedQuestion, this.players);
			// Set random selector for next question (no correct answer)
			this.gameStateService.initializeRandomSelector();
		}
		this.gameStateService.markQuestionAnswered();
	}

	/**
	 * Mark that no one knows the answer
	 */
	noOneKnows(): void {
		if (this.selectedQuestion) {
			this.gameService.markQuestionIncorrect(this.selectedQuestion);
			// Set random selector for next question (no one knew the answer)
			this.gameStateService.initializeRandomSelector();
		}
		this.gameStateService.markQuestionAnswered();
	}

  /**
   * Adjust player score
   */
  adjustScore(event: {player: Player, amount: number}): void {
    this.gameStateService.updatePlayerScore(event.player.id, event.amount);
  }

  /**
   * Reset all player scores
   */
  resetAllScores(): void {
    if (confirm('Reset all player scores to 0? This cannot be undone.')) {
      this.gameStateService.resetAllScores();
    }
  }

  /**
   * Reset all player scores (keyboard shortcut version - no confirmation)
   */
  resetAllScoresKeyboard(): void {
    this.gameStateService.resetAllScores();
  }

  /**
   * Start long press for special actions
   */
  startLongPress(action: string): void {
    this.longPressAction = action;
    this.longPressTimer = window.setTimeout(() => {
      this.executeLongPress();
    }, TIMING.LONG_PRESS_DURATION);
  }

  /**
   * End long press
   */
  endLongPress(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.longPressAction = '';
  }

  /**
   * Execute long press action
   */
  private executeLongPress(): void {
    switch (this.longPressAction) {
      case 'resetScores':
        this.resetAllScores();
        break;
      case 'resetRound':
        this.backToRoundSelection();
        break;
    }
    this.longPressAction = '';
  }

 	/**
 	 * Close question display
 	 */
 	close(): void {
 		this.audioService.stopThemeMusic();
 		this.gameStateService.closeQuestion();
 	}

 	/**
 	 * Reveal question (handled by QuestionDisplayComponent)
 	 */
 	reveal(): void {
 		// Reveal functionality is handled internally by QuestionDisplayComponent
 		// This method exists for keyboard shortcut consistency
 	}

}
