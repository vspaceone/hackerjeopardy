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

  it('should show reveal button when player has buzzed in (activePlayer exists)', () => {
    const player: Player = {
      id: 1,
      name: 'Test Player',
      score: 0,
      bgcolor: '#fff',
      fgcolor: '#000',
      btn: 'player1',
      key: '1',
      remainingtime: null
    };

    const question: Question = {
      question: 'What is the capital of France?',
      answer: 'Paris',
      value: 200,
      cat: 'Geography',
      available: true, // Question is still active
      availablePlayers: new Set([1]),
      activePlayers: new Set([1]),
      activePlayersArr: [1],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true,
      activePlayer: player // Player has buzzed in
    };

    component.question = question;
    component.showAnswer = false; // Answer not yet revealed
    component.isCorrectlyAnswered = false; // Not yet marked correct
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const revealButton = compiled.querySelector('.btn-reveal');
    expect(revealButton).toBeTruthy();
    expect(revealButton.textContent.trim()).toBe('Reveal Question');
  });

  it('should not show reveal button when answer is already shown', () => {
    const player: Player = {
      id: 1,
      name: 'Test Player',
      score: 0,
      bgcolor: '#fff',
      fgcolor: '#000',
      btn: 'player1',
      key: '1',
      remainingtime: null
    };

    const question: Question = {
      question: 'What is the capital of France?',
      answer: 'Paris',
      value: 200,
      cat: 'Geography',
      available: true,
      availablePlayers: new Set([1]),
      activePlayers: new Set([1]),
      activePlayersArr: [1],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true,
      activePlayer: player
    };

    component.question = question;
    component.showAnswer = true; // Answer already revealed
    component.isCorrectlyAnswered = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const revealButton = compiled.querySelector('.btn-reveal');
    expect(revealButton).toBeFalsy();
  });

  it('should not show reveal button when question has been correctly answered', () => {
    const player: Player = {
      id: 1,
      name: 'Test Player',
      score: 0,
      bgcolor: '#fff',
      fgcolor: '#000',
      btn: 'player1',
      key: '1',
      remainingtime: null
    };

    const question: Question = {
      question: 'What is the capital of France?',
      answer: 'Paris',
      value: 200,
      cat: 'Geography',
      available: true,
      availablePlayers: new Set([1]),
      activePlayers: new Set([1]),
      activePlayersArr: [1],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true,
      activePlayer: player
    };

    component.question = question;
    component.showAnswer = false;
    component.isCorrectlyAnswered = true; // Already marked correct
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const revealButton = compiled.querySelector('.btn-reveal');
    expect(revealButton).toBeFalsy();
  });
});