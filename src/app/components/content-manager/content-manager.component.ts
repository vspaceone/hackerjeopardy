import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentManagerService } from '../../services/content/content-manager.service';
import { RepositoryManagerService } from '../../services/content/repository-manager.service';
import { ControllerService } from '../../services/controller.service';
import {
  CacheStats,
  ContentUpdateInfo,
  ContentRepository,
  RepositoryValidationResult
} from '../../services/content/content.types';

@Component({
  selector: 'app-content-manager',
  templateUrl: './content-manager.component.html',
  styleUrls: ['./content-manager.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ContentManagerComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  // Cache management
  cacheStats: CacheStats | null = null;
  updateInfo: ContentUpdateInfo | null = null;
  checking = false;
  updating = false;
  clearing = false;

  // Repository management
  repositories: ContentRepository[] = [];
  loadingRepos = false;
  showAddRepo = false;
  addingRepo = false;
  validatingRepo = false;
  newRepoUrl = '';
  validationResult: RepositoryValidationResult | null = null;
  totalRounds = 0;

  // Controllers
  connectedControllers: Gamepad[] = [];
  hidConnected = false;
  hidSupported = false;

  constructor(
    private contentManager: ContentManagerService,
    private repoManager: RepositoryManagerService,
    private controllerService: ControllerService
  ) {}



  async checkForUpdates(): Promise<void> {
    this.checking = true;
    try {
      this.updateInfo = await this.contentManager.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      this.updateInfo = { hasUpdates: false, newRounds: [], updatedRounds: [], removedRounds: [] };
    } finally {
      this.checking = false;
    }
  }

  async updateContent(): Promise<void> {
    this.updating = true;
    try {
      await this.contentManager.updateContent();
      await this.loadStats();
      // Re-check for updates to show the current state
      this.updateInfo = await this.contentManager.checkForUpdates();
    } catch (error) {
      console.error('Failed to update content:', error);
      this.updateInfo = { hasUpdates: false, newRounds: [], updatedRounds: [], removedRounds: [] };
    } finally {
      this.updating = false;
    }
  }

  async clearCache(): Promise<void> {
    if (!confirm('Are you sure you want to clear all cached content? This will require re-downloading content for offline use.')) {
      return;
    }

    this.clearing = true;
    try {
      await this.contentManager.clearCache();
      await this.loadStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      this.clearing = false;
    }
  }

  private async loadStats(): Promise<void> {
    try {
      this.cacheStats = await this.contentManager.getCacheStats();
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      this.cacheStats = null;
    }
  }

  get formattedCacheSize(): string {
    if (!this.cacheStats) return '0 MB';
    const mb = (this.cacheStats.totalSize / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  }

  async ngOnInit(): Promise<void> {
    await this.loadRepositories();
    await this.loadCacheStats();

    // Load total rounds
    this.contentManager.getAvailableRounds().subscribe(rounds => {
      this.totalRounds = rounds.length;
    });

    // Subscribe to controller updates
    this.controllerService.connectedControllers$.subscribe(controllers => {
      this.connectedControllers = controllers;
    });

    // Check HID support
    this.hidSupported = 'hid' in navigator;
  }

  async loadCacheStats(): Promise<void> {
    try {
      this.cacheStats = await this.contentManager.getContentStats();
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  }

  // Repository management methods
  async loadRepositories(): Promise<void> {
    this.loadingRepos = true;
    try {
      this.repositories = await this.repoManager.getRepositories();
      // Ensure roundsCount is set from validationResult
      this.repositories.forEach(repo => {
        if (!repo.roundsCount && repo.validationResult) {
          repo.roundsCount = repo.validationResult.roundsCount;
        }
      });
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      this.loadingRepos = false;
    }
  }

  async toggleRepository(repoId: string): Promise<void> {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) return;

    try {
      await this.repoManager.updateRepository(repoId, { enabled: !repo.enabled });
      await this.loadRepositories(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle repository:', error);
    }
  }

  async removeRepository(repoId: string): Promise<void> {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) return;

    if (!confirm(`Remove repository "${repo.url}"? This will disable content from this repository.`)) {
      return;
    }

    try {
      await this.repoManager.removeRepository(repoId);
      await this.loadRepositories(); // Refresh list
    } catch (error) {
      console.error('Failed to remove repository:', error);
    }
  }

  async refreshRepository(repoId: string): Promise<void> {
    try {
      await this.repoManager.refreshRepositoryStatus(repoId);
      await this.loadRepositories(); // Refresh list
    } catch (error) {
      console.error('Failed to refresh repository:', error);
    }
  }

  async validateNewRepository(): Promise<void> {
    if (!this.newRepoUrl.trim()) return;

    this.validatingRepo = true;
    this.validationResult = null;

    try {
      this.validationResult = await this.repoManager.validateRepository(this.newRepoUrl.trim());
    } catch (error) {
      console.error('Validation error:', error);
      this.validationResult = {
        isValid: false,
        error: 'Validation failed'
      };
    } finally {
      this.validatingRepo = false;
    }
  }

  async addRepository(): Promise<void> {
    if (!this.validationResult?.isValid || !this.newRepoUrl.trim()) return;

    this.addingRepo = true;
    try {
      const repoUrl = this.newRepoUrl.trim();
      await this.repoManager.addRepository({
        url: repoUrl,
        enabled: true
      });

      // Reset form
      this.newRepoUrl = '';
      this.validationResult = null;
      this.showAddRepo = false;

      await this.loadRepositories(); // Refresh list

      // Check the actual status of the newly added repository
      const addedRepo = this.repositories.find(r => r.url === repoUrl);
      if (addedRepo) {
        await this.refreshRepository(addedRepo.id);
      }
    } catch (error) {
      console.error('Failed to add repository:', error);
    } finally {
      this.addingRepo = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'connected': return 'status-connected';
      case 'offline': return 'status-offline';
      case 'error': return 'status-error';
      case 'checking': return 'status-checking';
      default: return 'status-unknown';
    }
  }

  getStatusText(repo: ContentRepository): string {
    if (!repo.status) return 'Unknown';
    switch (repo.status.state) {
      case 'connected': return `Connected (${repo.status.roundsCount || 0} rounds)`;
      case 'offline': return 'Offline';
      case 'error': return `Error: ${repo.status.lastError || 'Unknown'}`;
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  }

  async connectHID(): Promise<void> {
    try {
      console.log('Connecting HID...');
      const success = await this.controllerService.connectHID();
      console.log('HID connect result:', success);
      this.hidConnected = success;
    } catch (error) {
      console.error('HID connect error:', error);
      this.hidConnected = false;
    }
  }

  onClose(): void {
    this.close.emit();
  }
}