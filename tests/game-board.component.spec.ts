import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardComponent } from '../src/app/components/game-board/game-board.component';
import { Category, Question } from '../src/app/models/game.models';

describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit questionSelected when question is selected', () => {
    spyOn(component.questionSelected, 'emit');
    const question: Question = {
      question: 'Test?',
      value: 100,
      cat: 'test',
      available: true,
      availablePlayers: new Set(),
      activePlayers: new Set(),
      activePlayersArr: [],
      timeoutPlayers: new Set(),
      timeoutPlayersArr: [],
      buttonsActive: true
    };

    component.selectQuestion(question);

    expect(component.questionSelected.emit).toHaveBeenCalledWith(question);
  });

  it('should display categories and questions', () => {
    const categories: Category[] = [
      {
        name: 'Category 1',
        lang: 'en',
        questions: [
          { question: 'Q1', value: 100, cat: 'cat1', available: true, availablePlayers: new Set(), activePlayers: new Set(), activePlayersArr: [], timeoutPlayers: new Set(), timeoutPlayersArr: [], buttonsActive: true },
          { question: 'Q2', value: 200, cat: 'cat1', available: true, availablePlayers: new Set(), activePlayers: new Set(), activePlayersArr: [], timeoutPlayers: new Set(), timeoutPlayersArr: [], buttonsActive: true }
        ]
      }
    ];

    component.categories = categories;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Category 1');
    expect(compiled.querySelectorAll('button').length).toBe(2);
  });
});