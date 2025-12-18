import { Injectable } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { AudioService } from './audio.service';
import { Player, Question } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly TIMEOUT = 6;
  private timer: Subscription | null = null;

  constructor(private audioService: AudioService) {}

  getDefaultPlayers(): Player[] {
    return [
      {
        id: 1,
        btn: "player1",
        name: "player1",
        score: 0,
        bgcolor: "#00d4ff",
        fgcolor: "#001122",
        key: "1",
        remainingtime: null
      },
      {
        id: 2,
        btn: "player2",
        name: "player2",
        score: 0,
        bgcolor: "#4dd4ff",
        fgcolor: "#001133",
        key: "2",
        remainingtime: null
      },
      {
        id: 3,
        btn: "player3",
        name: "player3",
        score: 0,
        bgcolor: "#80ddff",
        fgcolor: "#001144",
        key: "3",
        remainingtime: null
      },
      {
        id: 4,
        btn: "player4",
        name: "player4",
        score: 0,
        bgcolor: "#b3e6ff",
        fgcolor: "#001155",
        key: "4",
        remainingtime: null
      }
    ];
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
        this.decrementTimer(question, players);
      });
    }
  }

  decrementTimer(question: Question, players: Player[]): void {
    // Decrement the current active player (only one at a time in sequential mode)
    if (question.activePlayer && question.activePlayer.remainingtime > 0) {
      question.activePlayer.remainingtime--;
      if (question.activePlayer.remainingtime <= 0) {
        // Handle timeout - add to timeout players, clear active player, allow new buzzing
        this.audioService.playFail();
        question.timeoutPlayers.add(question.activePlayer.id);
        question.timeoutPlayersArr = Array.from(question.timeoutPlayers);
        question.activePlayers.delete(question.activePlayer.id);
        question.activePlayersArr = Array.from(question.activePlayers);
        question.activePlayer = undefined;

        // For sequential buzzing, don't start timer for next player automatically
        // Question stays open for remaining players to buzz in
        if (question.availablePlayers.size === 0) {
          this.notAnswered(question);
        }
      }
    }
  }

  private handleTimeout(question: Question): void {
    // This will be handled by the component that subscribes to timer events
  }

  correctAnswer(question: Question, players: Player[]): void {
    this.audioService.playSuccess();
    this.clearTimer();

    if (question.activePlayer) {
      question.activePlayer.score += question.value;
      question.player = question.activePlayer;
    }

    question.available = false;
    question.availablePlayers.clear();
    question.activePlayers.clear();
    question.activePlayersArr = Array.from(question.activePlayers);
    question.activePlayer = undefined;
  }

  incorrectAnswer(question: Question, players: Player[]): void {
    this.audioService.playFail();
    this.clearTimer(); // Clear current timer - decision is made
    if (question.activePlayer) {
      question.activePlayer.score -= question.value;

      // Remove current player from active players
      question.activePlayers.delete(question.activePlayer.id);
      question.activePlayersArr = Array.from(question.activePlayers);

      if (!question.timeoutPlayers.has(question.activePlayer.id)) {
        question.timeoutPlayers.add(question.activePlayer.id);
        question.timeoutPlayersArr = Array.from(question.timeoutPlayers);
      }

      // Decision is made - clear active player and allow new buzzing round
      question.activePlayer = undefined;

      // If no more players available to buzz in, close the question
      if (question.availablePlayers.size === 0) {
        this.notAnswered(question);
      }
      // Question stays open, allowing remaining players to buzz in sequentially
    }
  }



  notAnswered(question: Question): void {
    this.clearTimer();
    
    question.availablePlayers.clear();
    question.player = { btn: "none" } as Player;
    question.available = false;
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