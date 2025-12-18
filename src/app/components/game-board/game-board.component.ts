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

  selectQuestion(question: Question): void {
    if (question.available) {
      this.questionSelected.emit(question);
    }
  }

  getQuestionButtonClass(question: Question): string {
    if (!question.available && question.player && question.player.btn !== "none") {
      return 'btn-success answered-correctly';
    }
    if (!question.available && question.hasIncorrectAnswers) {
      return 'btn-warning answered-incorrectly';
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