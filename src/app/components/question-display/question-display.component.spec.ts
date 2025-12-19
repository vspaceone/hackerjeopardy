import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionDisplayComponent } from './question-display.component';
import { Question, Player } from '../../models/game.models';

describe('QuestionDisplayComponent', () => {
  let component: QuestionDisplayComponent;
  let fixture: ComponentFixture<QuestionDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit correct event when onCorrect is called', () => {
    spyOn(component.correct, 'emit');
    const question: Question = {
      question: 'Q?',
      answer: 'A',
      value: 100,
      cat: 'cat',
      available: true,
      availablePlayers: new Set(),
      activePlayers: new Set(),
      activePlayersArr: [],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true
    };
    component.question = question;

    component.onCorrect();

    expect(component.correct.emit).toHaveBeenCalled();
  });

  it('should emit incorrect event when onIncorrect is called', () => {
    spyOn(component.incorrect, 'emit');
    const question: Question = {
      question: 'Q?',
      answer: 'A',
      value: 100,
      cat: 'cat',
      available: true,
      availablePlayers: new Set(),
      activePlayers: new Set(),
      activePlayersArr: [],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true
    };
    component.question = question;

    component.onIncorrect();

    expect(component.incorrect.emit).toHaveBeenCalled();
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');

    component.onClose();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should display question and answer', () => {
    const question: Question = {
      question: 'What is 2+2?',
      answer: '4',
      value: 200,
      cat: 'Math',
      available: false,
      availablePlayers: new Set(),
      activePlayers: new Set(),
      activePlayersArr: [],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true
    };
    component.question = question;
    component.showAnswer = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('What is 2+2?');
    expect(compiled.textContent).toContain('4');
  });
});