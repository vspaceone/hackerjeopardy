import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameDataService } from './services/game-data.service';
import { GameService } from './services/game.service';
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
export class AppComponent implements OnInit, AfterViewInit {
	title = 'Hacker Jeopardy';
	availableRounds: RoundMetadata[] = [];
  loading = true;
  showContentManager = false;
  currentRoundName = '';
  hasControllers = false;

	constructor(
		private gameDataService: GameDataService,
		private gameService: GameService,
		private audioService: AudioService,
		private contentManager: ContentManagerService,
		private controllerService: ControllerService
	) { };

  async ngOnInit(): Promise<void> {
    try {
      console.log('AppComponent: Starting initialization...');
      // Initialize content manager
      console.log('AppComponent: Initializing content manager...');
      await this.contentManager.initialize();
      console.log('AppComponent: Content manager initialized');

			// Load available rounds
			console.log('AppComponent: Loading available rounds...');
			this.gameDataService.getAvailableRounds().subscribe({
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
			this.controllerService.playerActivated$.subscribe(playerId => {
				this.activatePlayer(playerId);
			});

			// Subscribe to controller detection
			this.controllerService.connectedControllers$.subscribe(controllers => {
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

	@HostListener('document:keydown', ['$event'])
	onKeyDown(event: KeyboardEvent): void {
		const key = event.key;
		if (!this.selectedQuestion || !this.qanda) return;

		// Handle number keys and special numpad keys
		let playerKey = '';
		if (key === '1' || key === '2' || key === '3' || key === '4') {
			playerKey = key;
		} else if (key === '¹' || key === '¡') {
			playerKey = '1'; // ¹ is superscript 1, ¡ is inverted !
		} else if (key === '²') {
			playerKey = '2';
		} else if (key === '³') {
			playerKey = '3';
		} else if (key === '¤' || key === '€') {
			playerKey = '4'; // ¤ is currency symbol, € is euro
		}

		if (playerKey) {
			event.preventDefault();
			this.activatePlayer(parseInt(playerKey));
		}
	}

	private activatePlayer(playerId: number): void {
		if (this.selectedQuestion && this.qanda) {
			// Normal buzzing during question
			const activated = this.gameService.activatePlayer(this.selectedQuestion, playerId, this.players);
			if (activated) {
				this.audioService.playBuzzer(playerId);
				this.couldBeCanceled = false; // Can't cancel once someone has buzzed in
			}
		} else if (this.qanda) {
			// Highlight player for identification during question selection
			const player = this.players.find(p => p.id === playerId);
			if (player) {
				player.highlighted = true;
				setTimeout(() => {
					player.highlighted = false;
				}, 3000); // Highlight for 3 seconds
			}
		}
	}

	private initMatrixRain(): void {
		const canvas = document.getElementById('matrixRain') as HTMLCanvasElement;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const matrix = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const matrixArray = matrix.split('');

		const fontSize = 16;
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

		setInterval(draw, 35);
	}

	selectedQuestion: any = null;

	couldBeCanceled = false; // Only true when a question is open and cancellable
	qanda: Category[] | null = null;


  selectSet(s: string): void {
    this.audioService.playClick();
    this.currentRoundName = s;
    this.gameDataService.loadGameRound(s).subscribe({
      next: (categories) => {
        this.qanda = categories;
      },
      error: (error) => {
        console.error('Error loading round:', s, error);
        alert(`Failed to load round "${s}": ${error.message}`);
      }
    });
  }

	resetQuestion(question: Question): void {
		this.gameService.resetQuestion(question, this.players);
		// Close modal if this question was selected
		if (this.selectedQuestion === question) {
			this.selectedQuestion = null;
			this.couldBeCanceled = false;
		}
	}

	backToRoundSelection(): void {
		// Clear all game state and return to round selection
		this.qanda = null;
		this.selectedQuestion = null;
		this.couldBeCanceled = false;
		this.audioService.stopThemeMusic();
	}

	onSelect(q): void {
		this.selectedQuestion = q;
		this.couldBeCanceled = true; // Allow canceling when question first opens
		this.audioService.playClick();
		this.audioService.startThemeMusic();
	}

	answered(q, p): void {
		this.audioService.stopThemeMusic();

		// Use GameService for correct answer handling
		if (this.selectedQuestion) {
			this.gameService.correctAnswer(this.selectedQuestion);
		}

		this.couldBeCanceled = false;
	}




	notanswered(q, p): void {
		// Use GameService for incorrect answer handling
		if (this.selectedQuestion) {
			this.gameService.incorrectAnswer(this.selectedQuestion);
		}

		this.couldBeCanceled = false;
	}

	minus(p): void {
		p.score = p.score - 100;
	}

	plus(p): void {
		p.score = p.score + 100;
	}

	correct(): void {
		this.answered(this.selectedQuestion, null);
	}

	incorrect(): void {
		this.notanswered(this.selectedQuestion, null);
	}

	noOneKnows(): void {
		if (this.selectedQuestion) {
			this.gameService.markQuestionIncorrect(this.selectedQuestion);
		}
		// Keep selectedQuestion to show the answer, user can close manually
		// this.selectedQuestion = null;
		// Keep couldBeCanceled as false since question is resolved
		this.couldBeCanceled = false;
	}

	adjustScore(event: {player: Player, amount: number}): void {
		event.player.score += event.amount;
	}

	close(): void {
		this.audioService.stopThemeMusic();
		this.selectedQuestion = null;
		this.couldBeCanceled = false;
	}

	cancel(): void {
		this.selectedQuestion = null;
		this.couldBeCanceled = false;
	}

	players: Player[] = [
		{
			id: 1,
			btn: 'player1',
			name: 'player1',
			score: 0,
			bgcolor: '#ff6b6b',
			fgcolor: '#9f0b0b',
			key: '1',
			remainingtime: null,
			highlighted: false
		},
		{
			id: 2,
			btn: 'player2',
			name: 'player2',
			score: 0,
			bgcolor: '#ff9900',
			fgcolor: '#995c00',
			key: '2',
			remainingtime: null,
			highlighted: false
		},
		{
			id: 3,
			btn: 'player3',
			name: 'player3',
			score: 0,
			bgcolor: '#9cfcff',
			fgcolor: '#3c9c9f',
			key: '3',
			remainingtime: null,
			highlighted: false
		},
		{
			id: 4,
			btn: 'player4',
			name: 'player4',
			score: 0,
			bgcolor: '#FFFF66',
			fgcolor: '#cccc00',
			key: '4',
			remainingtime: null,
			highlighted: false
		}
	];

}
