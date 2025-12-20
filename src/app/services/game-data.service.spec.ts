import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameDataService } from './game-data.service';
import { ContentManagerService } from './content/content-manager.service';
import { GameRound, Category, Question } from '../models/game.models';
import { RoundMetadata } from './content/content.types';
import { of, throwError } from 'rxjs';

describe('GameDataService', () => {
  let service: GameDataService;
  let httpMock: HttpTestingController;
  let contentManagerSpy: jasmine.SpyObj<ContentManagerService>;

  beforeEach(() => {
    const contentSpy = jasmine.createSpyObj('ContentManagerService', ['loadRound', 'getAvailableRounds']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameDataService,
        { provide: ContentManagerService, useValue: contentSpy }
      ]
    });
    service = TestBed.inject(GameDataService);
    httpMock = TestBed.inject(HttpTestingController);
    contentManagerSpy = TestBed.inject(ContentManagerService) as jasmine.SpyObj<ContentManagerService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAvailableSets', () => {
    it('should return available sets as observable', (done: DoneFn) => {
      const mockRounds: RoundMetadata[] = [
        { id: 'set1', name: 'Set 1', language: 'en', difficulty: 'easy', categories: [], lastModified: '2023-01-01', size: 1000 },
        { id: 'set2', name: 'Set 2', language: 'en', difficulty: 'medium', categories: [], lastModified: '2023-01-02', size: 2000 }
      ];
      contentManagerSpy.getAvailableRounds.and.returnValue(of(mockRounds));

      service.getAvailableSets().subscribe({
        next: (sets) => {
          expect(Array.isArray(sets)).toBe(true);
          expect(sets).toEqual(['set1', 'set2']);
          done();
        },
        error: (error) => {
          fail('Should not error: ' + error);
          done();
        }
      });
    });
  });

  describe('loadGameRound', () => {
    it('should load and process game round with categories', (done: DoneFn) => {
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

      // Mock ContentManagerService to throw error so it falls back to HTTP
      contentManagerSpy.loadRound.and.returnValue(Promise.reject('Round not found'));

      service.loadGameRound(setName).subscribe(categories => {
        expect(categories.length).toBe(2);
        expect(categories[0].name).toBe('Category 1');
        expect(categories[0].questions[0].value).toBe(100);
        expect(categories[0].questions[0].available).toBe(true);
        expect(categories[0].questions[0].cat).toBe('Category 1');
        expect(categories[0].questions[0].activePlayers).toEqual(new Set());
        expect(categories[0].questions[0].availablePlayers).toEqual(new Set([1, 2, 3, 4]));
        done();
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