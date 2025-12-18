import { Observable } from 'rxjs';
import { GameRound, Category } from '../../models/game.models';

export interface ContentProvider {
  readonly name: string;
  readonly priority: number;

  getManifest(): Observable<ContentManifest>;
  getRound(roundId: string): Observable<GameRound>;
  getCategory(roundId: string, categoryName: string): Observable<Category>;
  getImageUrl(roundId: string, categoryName: string, imageName: string): string;
  isAvailable(): Promise<boolean>;
}

export interface ContentManifest {
  rounds: RoundMetadata[];
  lastUpdated: string;
  totalRounds: number;
  totalSize: number; // Estimated bytes
  version: string;
}

export interface RoundMetadata {
  id: string;
  name: string;
  language: string;
  difficulty: string;
  categories: string[];
  author?: string;
  lastModified: string;
  size: number; // Estimated download size in bytes
  description?: string;
  tags?: string[];
}

export interface ContentCacheEntry {
  key: string; // IndexedDB key
  data: any;
  timestamp: number;
  type: 'manifest' | 'round' | 'category';
  id: string;
  size: number; // Size in bytes
  expiresAt: number;
}

export interface CacheStats {
  totalSize: number;
  cachedRounds: number;
  cachedCategories: number;
  lastCleanup: number;
}

export interface ContentUpdateInfo {
  hasUpdates: boolean;
  newRounds: RoundMetadata[];
  updatedRounds: RoundMetadata[];
  removedRounds: string[];
}

export interface PreloadConfig {
  enabled: boolean;
  maxRounds: number;
  priorityRounds: string[]; // Round IDs to preload first
  autoPreload: boolean; // Preload on app start
}

// Repository management interfaces
export interface ContentRepository {
  id: string;
  url: string;
  enabled: boolean;
  addedAt: Date;
  lastValidated?: Date;
  validationResult?: RepositoryValidationResult;
  roundsCount?: number;
  lastUpdated?: string;
  name?: string;
  status?: {
    state: 'checking' | 'connected' | 'error' | 'offline';
    roundsCount?: number;
    lastError?: string;
    lastUpdated?: string;
  };
  githubUrl?: string;
  priority?: number;
  manifest?: ContentManifest;
}

export interface RepositoryStatus {
  state: 'connected' | 'offline' | 'error' | 'checking';
  lastError?: string;
  roundsCount?: number;
  lastUpdated?: string;
}

export interface RepositoryValidationResult {
  isValid: boolean;
  manifest?: ContentManifest;
  error?: string;
  roundsCount?: number;
}

export interface RepositoryManager {
  getRepositories(): Promise<ContentRepository[]>;
  addRepository(repo: Omit<ContentRepository, 'id' | 'addedAt'>): Promise<void>;
  removeRepository(repoId: string): Promise<void>;
  updateRepository(repoId: string, updates: Partial<ContentRepository>): Promise<void>;
  validateRepository(url: string): Promise<RepositoryValidationResult>;
  getRepository(repoId: string): Promise<ContentRepository | null>;
}

// Enhanced manifest with repository metadata
export interface ContentManifest {
  rounds: RoundMetadata[];
  lastUpdated: string;
  totalRounds: number;
  totalSize: number;
  version: string;
  repository?: {
    name: string;
    description?: string;
    author?: string;
  };
}

// Re-export existing interfaces for convenience
export { Player, Question, Category, GameRound, GameState } from '../../models/game.models';