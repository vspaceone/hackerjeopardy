import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Question } from '../../models/game.models';
import { TIMING, BUTTON_VALUES } from '../../constants/game.constants';

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

  private longPressTimer: number | null = null;
  private readonly LONG_PRESS_DURATION = 1500; // 1.5 seconds for board reset (different from app-level)
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

    this.longPressTimer = window.setTimeout(() => {
      this.triggerReset(question);
    }, this.LONG_PRESS_DURATION);
  }

  onQuestionMouseUp(): void {
    if (this.longPressTimer !== null) {
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
    if (question.resetTimestamp && (Date.now() - question.resetTimestamp) < TIMING.QUESTION_RESET_ANIMATION) {
      return 'btn-danger reset';
    }

    // Existing logic
    if (!question.available && question.player &&
        question.player.btn === BUTTON_VALUES.INCORRECT) {
      return 'btn-warning answered-incorrectly';
    }
    if (!question.available && question.player &&
        question.player.btn !== BUTTON_VALUES.NONE) {
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