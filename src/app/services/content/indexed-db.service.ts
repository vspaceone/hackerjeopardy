import { Injectable } from '@angular/core';
import { ContentCacheEntry, CacheStats } from './content.types';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private readonly DB_NAME = 'hackerjeopardy-cache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'content';
  private db: IDBDatabase | null = null;

  private readonly MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  async set(key: string, entry: ContentCacheEntry): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const cacheEntry = {
        key,
        ...entry,
        expiresAt: entry.timestamp + this.CACHE_DURATION
      };

      const request = store.put(cacheEntry);

      request.onsuccess = async () => {
        // Enforce cache size after every write operation
        await this.enforceCacheSize();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get(key: string): Promise<ContentCacheEntry | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && this.isValidCache(result)) {
          resolve(result);
        } else {
          // Remove expired entry
          if (result) this.delete(key);
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<ContentCacheEntry[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.filter(entry => this.isValidCache(entry));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getByType(type: string): Promise<ContentCacheEntry[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const results = request.result.filter(entry => this.isValidCache(entry));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private isValidCache(entry: any): boolean {
    return entry.expiresAt > Date.now();
  }

  private async enforceCacheSize(): Promise<void> {
    const entries = await this.getAll();
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    if (totalSize <= this.MAX_CACHE_SIZE) return;

    // Sort by timestamp (oldest first) and remove entries until under limit
    const sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp);
    let currentSize = totalSize;

    for (const entry of sortedEntries) {
      if (currentSize <= this.MAX_CACHE_SIZE * 0.8) break; // Keep 80% free
      await this.delete(entry.key);
      currentSize -= entry.size;
    }
  }

  async getStats(): Promise<CacheStats> {
    const entries = await this.getAll();
    const rounds = entries.filter(entry => entry.type === 'round').length;
    const categories = entries.filter(entry => entry.type === 'category').length;
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    return {
      totalSize,
      cachedRounds: rounds,
      cachedCategories: categories,
      lastCleanup: Date.now() // Could track this separately
    };
  }

  // Clean expired entries from cache
  async cleanupExpired(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const entry = cursor.value;
          if (!this.isValidCache(entry)) {
            console.log(`IndexedDB: Removing expired entry: ${entry.key}`);
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Get all cached round IDs for quick lookup
  async getCachedRoundIds(): Promise<string[]> {
    const roundEntries = await this.getByType('round');
    return roundEntries.map(entry => entry.id);
  }
}