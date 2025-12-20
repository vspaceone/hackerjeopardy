import { Injectable } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { AudioService } from './audio.service';
import { Player, Question } from '../models/game.models';
import { TIMING, BUTTON_VALUES, PLAYER_CONFIG, PLAYER_COLORS } from '../constants/game.constants';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly TIMEOUT = TIMING.ANSWER_TIMEOUT;
  private timer: Subscription | null = null;

  constructor(private audioService: AudioService) {}

  getDefaultPlayers(): Player[] {
    return PLAYER_COLORS.map(color => ({
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



  activatePlayer(question: Question, playerId: number, players: Player[]): boolean {
    const pid = parseInt(playerId.toString());

    // Only allow activation if no player is currently active (sequential buzzing)
    if (question.activePlayers.size > 0 || !question.availablePlayers.has(pid) || !question.available) {
      return false;
    }

    question.availablePlayers.delete(pid);
    question.activePlayers.add(pid);
    question.activePlayersArr = Array.from(question.activePlayers);
    question.activePlayer = this.getPlayerById(pid, players);

    // Start timer for this player (sets remainingtime)
    this.startTimer(question, players);

    return true;
  }

  startTimer(question: Question, players: Player[]): void {
    if (!this.timer && question.activePlayer) {
      // Set timer for the active player
      question.activePlayer.remainingtime = this.TIMEOUT;
      this.timer = timer(0, 1000).subscribe(() => {
        this.decrementTimer(question);
      });
    }
  }

  decrementTimer(question: Question): void {
    // Decrement the current active player (only one at a time in sequential mode)
    if (question.activePlayer && question.activePlayer.remainingtime > 0) {
      question.activePlayer.remainingtime--;
      if (question.activePlayer.remainingtime <= 0) {
        // Handle timeout - timer stops but player stays active for host judgment
        this.audioService.playFail();
        question.timeoutPlayers.add(question.activePlayer.id);
        question.timeoutPlayersArr = Array.from(question.timeoutPlayers);
        // Keep player active so host can still judge their answer
        // Player will be deactivated when host clicks Correct/Incorrect
      }
    }
  }



  correctAnswer(question: Question): void {
    this.audioService.playSuccess();
    this.clearTimer();

    if (question.activePlayer) {
      question.activePlayer.score += question.value;
      question.player = question.activePlayer;
      // Track score change for potential reset
      if (!question.scoreChanges) question.scoreChanges = [];
      question.scoreChanges.push({
        playerId: question.activePlayer.id,
        change: question.value,
        timestamp: Date.now()
      });
      // Remove from active players now that decision is made
      question.activePlayers.delete(question.activePlayer.id);
      question.activePlayersArr = Array.from(question.activePlayers);
    }

    question.available = false;
    question.availablePlayers.clear();
    question.activePlayer = undefined;
  }

  incorrectAnswer(question: Question): void {
    this.audioService.playFail();
    this.clearTimer(); // Clear current timer - decision is made
    if (question.activePlayer) {
      question.activePlayer.score -= question.value;
      question.hadIncorrectAnswers = true; // Mark that incorrect answers were given

      // Track score change for potential reset
      if (!question.scoreChanges) question.scoreChanges = [];
      question.scoreChanges.push({
        playerId: question.activePlayer.id,
        change: -question.value,
        timestamp: Date.now()
      });

      // Remove current player from active players
      question.activePlayers.delete(question.activePlayer.id);
      question.activePlayersArr = Array.from(question.activePlayers);

      // Decision is made - clear active player and allow new buzzing round
      question.activePlayer = undefined;

      // If no more players available to buzz in, close the question
      if (question.availablePlayers.size === 0) {
        // If incorrect answers were given, mark as incorrectly answered
        if (question.hadIncorrectAnswers) {
          this.markQuestionIncorrect(question);
        } else {
          this.notAnswered(question);
        }
      }
      // Question stays open, allowing remaining players to buzz in sequentially
    }
  }



  notAnswered(question: Question): void {
    this.clearTimer();

    question.availablePlayers.clear();
    question.player = { btn: BUTTON_VALUES.NONE } as Player;
    question.available = false;
  }

  markQuestionIncorrect(question: Question): void {
    // Mark the question as having been attempted but answered incorrectly by all
    question.player = { btn: BUTTON_VALUES.INCORRECT } as Player;
    question.available = false;
    this.clearTimer();
  }

  resetQuestion(question: Question, players: Player[]): void {
    // Undo all recorded score changes
    question.scoreChanges?.forEach(change => {
      const player = players.find(p => p.id === change.playerId);
      if (player) {
        player.score -= change.change; // Undo the score change
      }
    });

    // Reset question to initial state
    question.available = true;
    question.player = undefined;
    question.activePlayer = undefined;
    question.activePlayers.clear();
    question.activePlayersArr = [];
    question.timeoutPlayers.clear();
    question.timeoutPlayersArr = [];
     // Reset to all active players (1 through current player count)
     const playerCount = players.length;
     question.availablePlayers = new Set(
       Array.from({ length: playerCount }, (_, i) => i + 1)
     );
    question.hadIncorrectAnswers = false;
    question.scoreChanges = [];
    question.resetTimestamp = Date.now();

    this.clearTimer();
  }

  getPlayerById(id: number, players: Player[]): Player | null {
    return players.find(player => player.id === id) || null;
  }

  adjustPlayerScore(player: Player, amount: number): void {
    player.score += amount;
  }

  clearTimer(): void {
    if (this.timer) {
      this.timer.unsubscribe();
      this.timer = null;
    }
  }

  getTimeout(): number {
    return this.TIMEOUT;
  }
}