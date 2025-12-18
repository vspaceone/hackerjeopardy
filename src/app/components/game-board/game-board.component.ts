import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Question } from '../../models/game.models';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GameBoardComponent {
  @Input() categories!: Category[];
  @Input() selectedQuestion?: Question;
  @Output() questionSelected = new EventEmitter<Question>();
  @Output() questionReset = new EventEmitter<Question>();

  private longPressTimer: any;
  private readonly LONG_PRESS_DURATION = 1500; // 1.5 seconds
  private longPressingQuestion?: Question;

  selectQuestion(question: Question): void {
    if (question.available) {
      this.questionSelected.emit(question);
    }
  }

  onQuestionMouseDown(question: Question, event: MouseEvent): void {
    if (!this.canResetQuestion(question)) return;

    event.preventDefault();
    this.longPressingQuestion = question;

    this.longPressTimer = setTimeout(() => {
      this.triggerReset(question);
    }, this.LONG_PRESS_DURATION);
  }

  onQuestionMouseUp(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.longPressingQuestion = undefined;
  }

  onQuestionMouseLeave(): void {
    this.onQuestionMouseUp(); // Treat mouse leave same as mouse up
  }

  private canResetQuestion(question: Question): boolean {
    return !question.available; // Only reset questions that have been interacted with
  }

  private triggerReset(question: Question): void {
    this.questionReset.emit(question);
    this.longPressingQuestion = undefined;
  }

  getQuestionButtonClass(question: Question): string {
    // Check for long-pressing state first
    if (question === this.longPressingQuestion) {
      return 'btn-danger long-pressing';
    }

    // Check for reset animation
    if (question.resetTimestamp && (Date.now() - question.resetTimestamp) < 1000) {
      return 'btn-danger reset';
    }

    // Existing logic
    if (!question.available && question.player && question.player.btn === "incorrect") {
      return 'btn-warning answered-incorrectly';
    }
    if (!question.available && question.player && question.player.btn !== "none") {
      return 'btn-success answered-correctly';
    }
    if (!question.available) {
      return 'btn-danger unanswered';
    }
    if (question.activePlayers && question.activePlayers.size > 0) {
      return 'btn-info active-question';
    }
    if (question === this.selectedQuestion) {
      return 'btn-warning selected';
    }
    return 'btn-primary question-btn';
  }

  trackByCategory(index: number, category: Category): string {
    return category.name;
  }

  trackByQuestion(index: number): number {
    return index;
  }
}