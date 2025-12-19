import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ContentManagerService } from './content-manager.service';
import { IndexedDBService } from './indexed-db.service';
import { ContentValidatorService } from './content-validator.service';
import { RepositoryManagerService } from './repository-manager.service';
import { CachedContentProvider } from './providers/cached-content.provider';
import { LocalContentProvider } from './providers/local-content.provider';
import { ContentProvider, RoundMetadata, ContentManifest } from './content.types';

describe('ContentManagerService', () => {
  let service: ContentManagerService;
  let mockRepositoryManager: jasmine.SpyObj<RepositoryManagerService>;
  let mockCachedProvider: jasmine.SpyObj<CachedContentProvider>;
  let mockLocalProvider: jasmine.SpyObj<LocalContentProvider>;
  let mockValidator: jasmine.SpyObj<ContentValidatorService>;

  // Mock round data
  const mockLocalRounds: RoundMetadata[] = [
    { id: 'local_round1', name: 'Local Round 1', language: 'en', difficulty: 'easy', lastModified: '2024-01-01', size: 1000 },
    { id: 'local_round2', name: 'Local Round 2', language: 'en', difficulty: 'medium', lastModified: '2024-01-01', size: 2000 }
  ];

  const mockGithubRounds: RoundMetadata[] = [
    { id: 'github_repo1_round1', name: 'GitHub Round 1', language: 'en', difficulty: 'easy', lastModified: '2024-01-01', size: 1500 },
    { id: 'github_repo1_round2', name: 'GitHub Round 2', language: 'en', difficulty: 'hard', lastModified: '2024-01-01', size: 2500 }
  ];

  const mockCacheRounds: RoundMetadata[] = [
    { id: 'cached_round1', name: 'Cached Round 1', language: 'en', difficulty: 'easy', lastModified: '2024-01-01', size: 1200 }
  ];

  const mockManifests = {
    local: { rounds: mockLocalRounds, lastUpdated: '2024-01-01', totalRounds: 2, totalSize: 3000, version: '1.0' },
    github: { rounds: mockGithubRounds, lastUpdated: '2024-01-01', totalRounds: 2, totalSize: 4000, version: '1.0' },
    cache: { rounds: mockCacheRounds, lastUpdated: '2024-01-01', totalRounds: 1, totalSize: 1200, version: '1.0' }
  };

  beforeEach(() => {
    const repositoryManagerSpy = jasmine.createSpyObj('RepositoryManagerService', ['initialize', 'getRepositories']);
    const cachedProviderSpy = jasmine.createSpyObj('CachedContentProvider', ['getManifest']);
    const localProviderSpy = jasmine.createSpyObj('LocalContentProvider', ['getManifest']);
    const validatorSpy = jasmine.createSpyObj('ContentValidatorService', ['validateRoundMetadata']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContentManagerService,
        { provide: RepositoryManagerService, useValue: repositoryManagerSpy },
        { provide: CachedContentProvider, useValue: cachedProviderSpy },
        { provide: LocalContentProvider, useValue: localProviderSpy },
        { provide: ContentValidatorService, useValue: validatorSpy },
        IndexedDBService
      ]
    });

    service = TestBed.inject(ContentManagerService);
    mockRepositoryManager = TestBed.inject(RepositoryManagerService) as jasmine.SpyObj<RepositoryManagerService>;
    mockCachedProvider = TestBed.inject(CachedContentProvider) as jasmine.SpyObj<CachedContentProvider>;
    mockLocalProvider = TestBed.inject(LocalContentProvider) as jasmine.SpyObj<LocalContentProvider>;
    mockValidator = TestBed.inject(ContentValidatorService) as jasmine.SpyObj<ContentValidatorService>;

    // Setup default mocks
    mockRepositoryManager.initialize.and.returnValue(Promise.resolve());
    mockRepositoryManager.getRepositories.and.returnValue(Promise.resolve([]));
    mockCachedProvider.getManifest.and.returnValue(of(mockManifests.cache));
    mockLocalProvider.getManifest.and.returnValue(of(mockManifests.local));
    mockValidator.validateRoundMetadata.and.returnValue({ isValid: true, errors: [], warnings: [] });

    // Mock provider properties
    Object.defineProperty(mockCachedProvider, 'name', { value: 'Cache' });
    Object.defineProperty(mockCachedProvider, 'priority', { value: 1 });
    Object.defineProperty(mockLocalProvider, 'name', { value: 'Local' });
    Object.defineProperty(mockLocalProvider, 'priority', { value: 3 });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize content manager', async () => {
    await service.initialize();
    expect(service).toBeTruthy();
  });

  describe('getAvailableRounds', () => {
    it('should combine rounds from all providers (cache, github, local)', (done) => {
      // Create a mock GitHub provider
      const mockGithubProvider = jasmine.createSpyObj('GitHubContentProvider', ['getManifest']);
      mockGithubProvider.getManifest.and.returnValue(of(mockManifests.github));
      Object.defineProperty(mockGithubProvider, 'name', { value: 'GitHub' });
      Object.defineProperty(mockGithubProvider, 'priority', { value: 2 });

      // Setup providers array to include GitHub
      (service as any).providers = [mockCachedProvider, mockGithubProvider, mockLocalProvider];

      service.getAvailableRounds().subscribe(rounds => {
        expect(rounds.length).toBe(5); // 1 cache + 2 github + 2 local
        expect(rounds).toContain(jasmine.objectContaining({ id: 'cached_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'github_repo1_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'github_repo1_round2' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round2' }));
        done();
      });
    });

    it('should handle provider failures gracefully', (done) => {
      const mockGithubProvider = jasmine.createSpyObj('GitHubContentProvider', ['getManifest']);
      mockGithubProvider.getManifest.and.returnValue(throwError(() => new Error('Network error')));
      Object.defineProperty(mockGithubProvider, 'name', { value: 'GitHub' });
      Object.defineProperty(mockGithubProvider, 'priority', { value: 2 });

      // Setup providers array to include failing GitHub provider
      (service as any).providers = [mockCachedProvider, mockGithubProvider, mockLocalProvider];

      service.getAvailableRounds().subscribe(rounds => {
        // Should still return rounds from cache and local providers despite GitHub failure
        expect(rounds.length).toBe(3); // 1 cache + 2 local
        expect(rounds).toContain(jasmine.objectContaining({ id: 'cached_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round2' }));
        done();
      });
    });

    it('should deduplicate rounds with same ID (prefer higher priority)', (done) => {
      const duplicateRound: RoundMetadata = {
        id: 'local_round1',
        name: 'Duplicate Round',
        language: 'en',
        difficulty: 'hard', // Different from local version
        lastModified: '2024-01-02',
        size: 1500
      };

      const mockGithubProvider = jasmine.createSpyObj('GitHubContentProvider', ['getManifest']);
      mockGithubProvider.getManifest.and.returnValue(of({ ...mockManifests.github, rounds: [duplicateRound] }));
      Object.defineProperty(mockGithubProvider, 'name', { value: 'GitHub' });
      Object.defineProperty(mockGithubProvider, 'priority', { value: 2 });

      // Setup providers array
      (service as any).providers = [mockCachedProvider, mockGithubProvider, mockLocalProvider];

      service.getAvailableRounds().subscribe(rounds => {
        const localRound = rounds.find(r => r.id === 'local_round1');
        expect(localRound).toBeDefined();
        expect(localRound!.difficulty).toBe('easy'); // Should keep original (from higher priority provider)
        done();
      });
    });

    it('should validate rounds and filter out invalid ones', (done) => {
      // Make validator reject one round
      mockValidator.validateRoundMetadata.and.callFake((round: RoundMetadata) => {
        if (round.id === 'local_round2') {
          return { isValid: false, errors: [{ field: 'id', message: 'Invalid round', severity: 'error' }], warnings: [] };
        }
        return { isValid: true, errors: [], warnings: [] };
      });

      (service as any).providers = [mockCachedProvider, mockLocalProvider];

      service.getAvailableRounds().subscribe(rounds => {
        expect(rounds.length).toBe(2); // cache round + valid local round
        expect(rounds).toContain(jasmine.objectContaining({ id: 'cached_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round1' }));
        expect(rounds.find(r => r.id === 'local_round2')).toBeUndefined();
        done();
      });
    });

    it('should handle empty manifests gracefully', (done) => {
      const mockGithubProvider = jasmine.createSpyObj('GitHubContentProvider', ['getManifest']);
      mockGithubProvider.getManifest.and.returnValue(of({ rounds: [], lastUpdated: '2024-01-01', totalRounds: 0, totalSize: 0, version: '1.0' }));
      Object.defineProperty(mockGithubProvider, 'name', { value: 'GitHub' });
      Object.defineProperty(mockGithubProvider, 'priority', { value: 2 });

      (service as any).providers = [mockCachedProvider, mockGithubProvider, mockLocalProvider];

      service.getAvailableRounds().subscribe(rounds => {
        expect(rounds.length).toBe(3); // cache + local rounds only
        done();
      });
    });

    it('should work with only local provider (regression test)', (done) => {
      (service as any).providers = [mockLocalProvider];

      service.getAvailableRounds().subscribe(rounds => {
        expect(rounds.length).toBe(2);
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round1' }));
        expect(rounds).toContain(jasmine.objectContaining({ id: 'local_round2' }));
        done();
      });
    });
  });

  describe('loadRound', () => {
    it('should load round from highest priority provider', async () => {
      const mockRound = { id: 'test_round', name: 'Test Round', categories: ['cat1'] };
      const mockGithubProvider = jasmine.createSpyObj('GitHubContentProvider', ['getRound']);
      mockGithubProvider.getRound.and.returnValue(of(mockRound));
      Object.defineProperty(mockGithubProvider, 'name', { value: 'GitHub' });
      Object.defineProperty(mockGithubProvider, 'priority', { value: 2 });

      (service as any).providers = [mockCachedProvider, mockGithubProvider, mockLocalProvider];
      mockCachedProvider.getRound = jasmine.createSpy().and.returnValue(throwError(() => new Error('Not found')));
      mockLocalProvider.getRound = jasmine.createSpy().and.returnValue(throwError(() => new Error('Not found')));

      const result = await service.loadRound('test_round');
      expect(result).toEqual(mockRound);
      expect(mockGithubProvider.getRound).toHaveBeenCalledWith('test_round');
    });

    it('should validate loaded rounds', async () => {
      const mockRound = { id: 'test_round', name: 'Test Round', categories: ['cat1'] };
      const mockGithubProvider = jasmine.createSpyObj('GitHubContentProvider', ['getRound']);
      mockGithubProvider.getRound.and.returnValue(of(mockRound));
      Object.defineProperty(mockGithubProvider, 'name', { value: 'GitHub' });
      Object.defineProperty(mockGithubProvider, 'priority', { value: 2 });

      (service as any).providers = [mockCachedProvider, mockGithubProvider, mockLocalProvider];

      // Make validator reject the round
      mockValidator.validateGameRound = jasmine.createSpy().and.returnValue({ isValid: false, errors: ['Invalid round'] });

      await expectAsync(service.loadRound('test_round')).toBeRejectedWithError('Round test_round not found in any provider');
    });
  });

  describe('isContentAvailable', () => {
    it('should return true when rounds are available', async () => {
      (service as any).providers = [mockLocalProvider];
      const result = await service.isContentAvailable();
      expect(result).toBe(true);
    });

    it('should return false when no rounds are available', async () => {
      mockLocalProvider.getManifest.and.returnValue(of({ rounds: [], lastUpdated: '2024-01-01', totalRounds: 0, totalSize: 0, version: '1.0' }));
      (service as any).providers = [mockLocalProvider];
      const result = await service.isContentAvailable();
      expect(result).toBe(false);
    });
  });
});