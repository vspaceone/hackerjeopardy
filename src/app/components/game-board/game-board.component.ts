import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Question, Player } from '../../models/game.models';
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
  @Input() players!: Player[];
  @Input() selectedQuestion?: Question;
  @Output() questionSelected = new EventEmitter<Question>();
  @Output() questionReset = new EventEmitter<Question>();

  // Keyboard navigation state
  keyboardSelectedCategory: number = 0;
  keyboardSelectedQuestion: number = 0;

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

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.categories || this.categories.length === 0) return;

    // Don't handle keyboard navigation if a question is already selected
    if (this.selectedQuestion) return;

    let handled = false;

    switch (event.key) {
      case 'ArrowUp':
        handled = true;
        this.moveSelection(0, -1);
        break;
      case 'ArrowDown':
        handled = true;
        this.moveSelection(0, 1);
        break;
      case 'ArrowLeft':
        handled = true;
        this.moveSelection(-1, 0);
        break;
      case 'ArrowRight':
        handled = true;
        this.moveSelection(1, 0);
        break;
      case 'Enter':
        handled = true;
        this.selectKeyboardQuestion();
        break;
      default:
        // Check for number keys (1-5 for question values)
        const numKey = parseInt(event.key);
        if (numKey >= 1 && numKey <= 5) {
          handled = true;
          this.keyboardSelectedQuestion = numKey - 1;
          this.selectKeyboardQuestion();
        }
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  }

  private moveSelection(deltaCategory: number, deltaQuestion: number): void {
    const maxCategory = this.categories.length - 1;
    const maxQuestion = 4; // 5 questions per category (0-4)

    this.keyboardSelectedCategory = Math.max(0, Math.min(maxCategory,
      this.keyboardSelectedCategory + deltaCategory));

    this.keyboardSelectedQuestion = Math.max(0, Math.min(maxQuestion,
      this.keyboardSelectedQuestion + deltaQuestion));
  }

  private selectKeyboardQuestion(): void {
    const category = this.categories[this.keyboardSelectedCategory];
    if (category && category.questions[this.keyboardSelectedQuestion]) {
      const question = category.questions[this.keyboardSelectedQuestion];
      if (question.available) {
        this.selectQuestion(question);
      }
    }
  }

  isKeyboardSelected(categoryIndex: number, questionIndex: number): boolean {
    return categoryIndex === this.keyboardSelectedCategory &&
           questionIndex === this.keyboardSelectedQuestion;
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

    // Check for completed questions
    if (!question.available) {
      if (question.player && question.player.btn !== BUTTON_VALUES.NONE &&
          question.player.btn !== BUTTON_VALUES.INCORRECT) {
        // Correctly answered - use player color
        return `answered-correctly player-${question.player.id}`;
      } else {
        // Incorrectly answered or unanswered - use muted disabled look
        return 'muted-disabled';
      }
    }

    // Existing logic for active/selected states
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