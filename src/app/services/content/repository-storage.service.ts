import { Injectable } from '@angular/core';
import { ContentRepository, RepositoryStatus } from './content.types';

@Injectable({
  providedIn: 'root'
})
export class RepositoryStorageService {
  private readonly STORAGE_KEY = 'hackerjeopardy-repositories';
  private readonly STORAGE_VERSION = '1.0';

  async getRepositories(): Promise<ContentRepository[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        // Return default repository if none stored
        return [this.getDefaultRepository()];
      }

      const data = JSON.parse(stored);

      // Handle version migration if needed
      if (data.version !== this.STORAGE_VERSION) {
        return [this.getDefaultRepository()];
      }

      return data.repositories.map((repo: any) => ({
        ...repo,
        status: repo.status || { state: 'checking' as const }
      }));
    } catch (error) {
      console.error('Failed to load repositories:', error);
      return [this.getDefaultRepository()];
    }
  }

  async saveRepositories(repositories: ContentRepository[]): Promise<void> {
    try {
      const data = {
        version: this.STORAGE_VERSION,
        repositories,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save repositories:', error);
      throw error;
    }
  }

  async addRepository(repository: ContentRepository): Promise<void> {
    const repositories = await this.getRepositories();
    repositories.push(repository);
    await this.saveRepositories(repositories);
  }

  async updateRepository(repoId: string, updates: Partial<ContentRepository>): Promise<void> {
    const repositories = await this.getRepositories();
    const index = repositories.findIndex(repo => repo.id === repoId);

    if (index !== -1) {
      repositories[index] = { ...repositories[index], ...updates };
      await this.saveRepositories(repositories);
    }
  }

  async removeRepository(repoId: string): Promise<void> {
    const repositories = await this.getRepositories();
    const filtered = repositories.filter(repo => repo.id !== repoId);
    await this.saveRepositories(filtered);
  }

  async getRepository(repoId: string): Promise<ContentRepository | null> {
    const repositories = await this.getRepositories();
    return repositories.find(repo => repo.id === repoId) || null;
  }

  private getDefaultRepository(): ContentRepository {
    return {
      id: 'default',
      url: 'krauni/hackerjeopardy-content',
      enabled: false, // Disable by default to use local content
      addedAt: new Date(),
      status: { state: 'checking' }
    };
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}