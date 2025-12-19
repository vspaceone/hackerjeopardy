import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question, Player } from '../../models/game.models';
import { ContentManagerService } from '../../services/content/content-manager.service';

@Component({
  selector: 'app-question-display',
  templateUrl: './question-display.component.html',
  styleUrls: ['./question-display.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class QuestionDisplayComponent {
  @Input() question?: Question;
  @Input() canCancel: boolean = false;
  @Input() players: Player[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() correct = new EventEmitter<void>();
  @Output() incorrect = new EventEmitter<void>();
  @Output() noOneKnows = new EventEmitter<void>();
  @Output() playerRename = new EventEmitter<Player>();

  showAnswer: boolean = false;
  isCorrectlyAnswered: boolean = false;

  constructor(private contentManager: ContentManagerService) {}



  getImageUrl(): string | null {
    if (!this.question?.image) return null;

    // If it's already a full URL, return it
    if (this.question.image.startsWith('http') || this.question.image.startsWith('/assets/')) {
      return this.question.image;
    }

    // Use ContentManagerService for proper URL resolution
    if (this.question.roundId && this.question.cat) {
      const url = this.contentManager.getImageUrl(this.question.roundId, this.question.cat, this.question.image);
      if (url) {
        return url;
      }
    }

    // Fallback: return as-is
    return this.question.image;
  }

  onClose(): void {
    this.close.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onCorrect(): void {
    this.isCorrectlyAnswered = true;
    this.showAnswer = true; // Auto-reveal question when correct
    this.correct.emit();
  }

  onIncorrect(): void {
    this.incorrect.emit();
  }

  onNoOneKnows(): void {
    this.showAnswer = true;
    this.noOneKnows.emit();
  }

  onRenamePlayer(player: Player): void {
    this.playerRename.emit(player);
  }

  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }

  getActivePlayerIds(): number[] {
    return this.question?.activePlayersArr || [];
  }

  getPlayerById(id: number): Player | undefined {
    return this.players.find(player => player.id === id);
  }
}