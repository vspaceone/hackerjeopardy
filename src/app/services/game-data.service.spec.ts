import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameDataService } from './game-data.service';
import { GameRound, Category, Question } from '../models/game.models';

describe('GameDataService', () => {
  let service: GameDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameDataService]
    });
    service = TestBed.inject(GameDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAvailableSets', () => {
    it('should return KIT sets by default', () => {
      const sets = service.getAvailableSets();
      expect(sets).toEqual([
        "XMAS19_1_en",
        "XMAS19_2_en",
        "XMAS19_3_en",
        "Lounge_And_Chill_1_en",
        "Lounge_And_Chill_2_en",
        "XMAS18_1_en",
        "XMAS22_1_en",
        "XMAS22_2_en",
        "XMAS22_3_en",
        "Demo"
      ]);
    });

    it('should return VSPACE sets when useVspace is true', () => {
      const sets = service.getAvailableSets(true);
      expect(sets).toEqual([
        "XMAS19_1_de",
        "XMAS19_2_de",
        "XMAS19_3_de",
        "XMAS19_4_de",
        "Lounge_And_Chill_1_de",
        "Lounge_And_Chill_2_de",
        "Lounge_And_Chill_3_de",
        "XMAS18_1_de",
        "XMAS18_2_de",
        "XMAS22_1_en",
        "XMAS22_2_en",
        "mixed_bag_round",
        "AlexRound"
      ]);
    });
  });

  describe('loadGameRound', () => {
    it('should load and process game round with categories', () => {
      const setName = 'testSet';
      const mockRound: GameRound = {
        name: 'Test Round',
        categories: ['cat1', 'cat2']
      };

      const mockCat1: Category = {
        name: 'Category 1',
        lang: 'en',
        questions: [
          { question: 'Q1', answer: 'A1' } as Question,
          { question: 'Q2', answer: 'A2' } as Question
        ]
      };

      const mockCat2: Category = {
        name: 'Category 2',
        lang: 'en',
        questions: [
          { question: 'Q3', answer: 'A3' } as Question
        ]
      };

      service.loadGameRound(setName).subscribe(categories => {
        expect(categories.length).toBe(2);
        expect(categories[0].name).toBe('Category 1');
        expect(categories[0].questions[0].value).toBe(100);
        expect(categories[0].questions[0].available).toBe(true);
        expect(categories[0].questions[0].cat).toBe('Category 1');
        expect(categories[0].questions[0].activePlayers).toEqual(new Set());
        expect(categories[0].questions[0].availablePlayers).toEqual(new Set([1, 2, 3, 4]));
      });

      const roundReq = httpMock.expectOne(`/assets/${setName}/round.json`);
      expect(roundReq.request.method).toBe('GET');
      roundReq.flush(mockRound);

      const cat1Req = httpMock.expectOne(`/assets/${setName}/cat1/cat.json`);
      cat1Req.flush(mockCat1);

      const cat2Req = httpMock.expectOne(`/assets/${setName}/cat2/cat.json`);
      cat2Req.flush(mockCat2);
    });
  });
});