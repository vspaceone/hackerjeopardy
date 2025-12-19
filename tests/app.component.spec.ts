import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from '../src/app/app.component';
import { GameDataService } from '../src/app/services/game-data.service';
import { GameService } from '../src/app/services/game.service';
import { AudioService } from '../src/app/services/audio.service';
import { ContentManagerService } from '../src/app/services/content/content-manager.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let audioServiceSpy: jasmine.SpyObj<AudioService>;
  let contentManagerSpy: jasmine.SpyObj<ContentManagerService>;

  beforeEach(async () => {
    const gameDataSpy = jasmine.createSpyObj('GameDataService', ['getAvailableSets', 'loadGameRound']);
    const gameSpy = jasmine.createSpyObj('GameService', ['activatePlayer', 'resetQuestion', 'correctAnswer', 'incorrectAnswer', 'markQuestionIncorrect']);
    const audioSpy = jasmine.createSpyObj('AudioService', ['playClick', 'playBuzzer', 'stopThemeMusic', 'startThemeMusic', 'playSuccess', 'playFail']);
    const contentSpy = jasmine.createSpyObj('ContentManagerService', ['initialize']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: GameDataService, useValue: gameDataSpy },
        { provide: GameService, useValue: gameSpy },
        { provide: AudioService, useValue: audioSpy },
        { provide: ContentManagerService, useValue: contentSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    gameDataServiceSpy = TestBed.inject(GameDataService) as jasmine.SpyObj<GameDataService>;
    gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    audioServiceSpy = TestBed.inject(AudioService) as jasmine.SpyObj<AudioService>;
    contentManagerSpy = TestBed.inject(ContentManagerService) as jasmine.SpyObj<ContentManagerService>;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'Hacker Jeopardy'`, () => {
    expect(component.title).toEqual('Hacker Jeopardy');
  });

  it('should initialize with loading true', () => {
    expect(component.loading).toBeTruthy();
    expect(component.sets).toEqual([]);
  });

  it('should call contentManager.initialize and load sets on ngOnInit', async () => {
    contentManagerSpy.initialize.and.returnValue(Promise.resolve());
    gameDataServiceSpy.getAvailableSets.and.returnValue(of(['set1', 'set2']));

    await component.ngOnInit();

    expect(contentManagerSpy.initialize).toHaveBeenCalled();
    expect(gameDataServiceSpy.getAvailableSets).toHaveBeenCalled();
    expect(component.sets).toEqual(['set1', 'set2']);
    expect(component.loading).toBeFalsy();
  });

  it('should handle keydown for player activation', () => {
    const question: any = {
      question: 'Test?',
      value: 100,
      cat: 'test',
      available: true,
      activePlayers: new Set(),
      availablePlayers: new Set([1,2,3,4]),
      activePlayer: null,
      timeoutPlayers: new Set(),
      activePlayersArr: [],
      timeoutPlayersArr: [],
      buttonsActive: true
    };
    component.selectedQuestion = question;
    component.qanda = [] as any;

    gameServiceSpy.activatePlayer.and.returnValue(true);

    const event = new KeyboardEvent('keydown', { key: '1' });
    component.onKeyDown(event);

    expect(gameServiceSpy.activatePlayer).toHaveBeenCalledWith(question, 1, component.players);
    expect(audioServiceSpy.playBuzzer).toHaveBeenCalled();
  });

  it('should select set and load categories', () => {
    const categories = [{ name: 'Cat1', lang: 'en', questions: [] }];
    gameDataServiceSpy.loadGameRound.and.returnValue(of(categories as any));

    component.selectSet('test-set');

    expect(audioServiceSpy.playClick).toHaveBeenCalled();
    expect(gameDataServiceSpy.loadGameRound).toHaveBeenCalledWith('test-set');
    expect(component.qanda).toEqual(categories as any);
  });

  it('should handle correct answer', () => {
    const question: any = { question: 'Q?', value: 200, cat: 'cat', available: true, activePlayers: new Set(), activePlayersArr: [], timeoutPlayers: new Set(), timeoutPlayersArr: [], availablePlayers: new Set(), buttonsActive: true };
    component.selectedQuestion = question;

    component.correct();

    expect(gameServiceSpy.correctAnswer).toHaveBeenCalledWith(question);
    expect(audioServiceSpy.stopThemeMusic).toHaveBeenCalled();
  });

  it('should handle incorrect answer', () => {
    const question: any = { question: 'Q?', value: 200, cat: 'cat', available: true, activePlayers: new Set(), activePlayersArr: [], timeoutPlayers: new Set(), timeoutPlayersArr: [], availablePlayers: new Set(), buttonsActive: true };
    component.selectedQuestion = question;

    component.incorrect();

    expect(gameServiceSpy.incorrectAnswer).toHaveBeenCalledWith(question);
    expect(audioServiceSpy.stopThemeMusic).toHaveBeenCalled();
  });

  it('should close question modal', () => {
    component.selectedQuestion = {} as any;
    component.close();

    expect(component.selectedQuestion).toBeNull();
    expect(component.couldBeCanceled).toBeFalsy();
    expect(audioServiceSpy.stopThemeMusic).toHaveBeenCalled();
  });

  it('should have 4 default players', () => {
    expect(component.players.length).toBe(4);
    expect(component.players[0].name).toBe('player1');
    expect(component.players[3].name).toBe('player4');
  });
});
