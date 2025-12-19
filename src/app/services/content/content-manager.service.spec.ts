import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContentManagerService } from './content-manager.service';
import { IndexedDBService } from './indexed-db.service';
import { ContentValidatorService } from './content-validator.service';

describe('ContentManagerService', () => {
  let service: ContentManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContentManagerService,
        IndexedDBService,
        ContentValidatorService
      ]
    });
    service = TestBed.inject(ContentManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize content manager', async () => {
    await service.initialize();
    expect(service).toBeTruthy();
  });
});