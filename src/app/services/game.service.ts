import { Injectable } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { AudioService } from './audio.service';
import { Player, Question, QueuedPlayer } from '../models/game.models';
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

    // Check if question is available and player can buzz
    if (!question.available || question.queueResolved) {
      return false;
    }

    // If no queue exists yet, this is the first buzz - create queue
    if (question.buzzQueue.length === 0) {
      this.initializeBuzzQueue(question, pid, players);
      return true;
    }

    // If queue exists but player already buzzed, ignore
    if (question.buzzQueue.some(entry => entry.playerId === pid)) {
      return false;
    }

    // Add player to existing queue in speed order
    this.addToQueue(question, pid);
    return true;
  }

  private initializeBuzzQueue(question: Question, firstPlayerId: number, players: Player[]): void {
    // Initialize queue with first player
    question.buzzQueue = [{
      playerId: firstPlayerId,
      buzzTimestamp: Date.now(),
      position: 1,
      status: 'answering'
    }];
    question.currentQueueIndex = 0;

    // Set active player and start timer
    question.activePlayer = this.getPlayerById(firstPlayerId, players);
    this.startTimer(question, players);
  }

  private addToQueue(question: Question, playerId: number): void {
    const queueEntry: QueuedPlayer = {
      playerId,
      buzzTimestamp: Date.now(),
      position: 0, // Will be updated
      status: 'waiting'
    };

    // Insert in speed order (earliest timestamp first)
    const insertIndex = question.buzzQueue.findIndex(
      entry => entry.buzzTimestamp > queueEntry.buzzTimestamp
    );

    if (insertIndex === -1) {
      question.buzzQueue.push(queueEntry);
    } else {
      question.buzzQueue.splice(insertIndex, 0, queueEntry);
    }

    // Update all positions
    question.buzzQueue.forEach((entry, index) => {
      entry.position = index + 1;
    });
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

      // Mark current player as completed in queue
      const currentEntry = question.buzzQueue[question.currentQueueIndex];
      if (currentEntry) {
        currentEntry.status = 'completed';
      }

      // End question immediately on correct answer
      question.available = false;
      question.queueResolved = true;
      question.activePlayer = undefined;
    }
  }

  incorrectAnswer(question: Question, players: Player[]): void {
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

      // Remove current player from queue permanently
      const currentEntry = question.buzzQueue.splice(question.currentQueueIndex, 1)[0];
      if (currentEntry) {
        currentEntry.status = 'eliminated';
      }

      // Update positions for remaining players
      question.buzzQueue.forEach((entry, index) => {
        entry.position = index + 1;
      });

      // Advance to next player (index stays the same since we removed current)
      this.advanceQueue(question, players);
    }
  }

  advanceQueue(question: Question, players: Player[]): void {
    if (question.queueResolved) return;

    question.currentQueueIndex++;

    if (question.currentQueueIndex >= question.buzzQueue.length) {
      // Queue exhausted - no correct answers
      if (question.hadIncorrectAnswers) {
        this.markQuestionIncorrect(question);
      } else {
        this.notAnswered(question);
      }
      return;
    }

    // Set next player as active
    const nextPlayerEntry = question.buzzQueue[question.currentQueueIndex];
    if (nextPlayerEntry) {
      nextPlayerEntry.status = 'answering';
      question.activePlayer = this.getPlayerById(nextPlayerEntry.playerId, players);
      this.startTimer(question, players);
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

    // Reset queuing system
    question.buzzQueue = [];
    question.currentQueueIndex = 0;
    question.queueResolved = false;

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