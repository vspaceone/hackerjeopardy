import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundMetadata } from '../../services/content/content.types';

@Component({
  selector: 'app-set-selection',
  templateUrl: './set-selection.component.html',
  styleUrls: ['./set-selection.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SetSelectionComponent implements OnInit, OnDestroy {
  @Input() availableRounds: RoundMetadata[] = [];
  @Output() setSelected = new EventEmitter<string>();
  @Output() openContentManager = new EventEmitter<void>();

  selectedIndex: number = 0;

  ngOnInit(): void {
    // Reset selection when rounds change
    this.selectedIndex = 0;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Don't handle keyboard navigation when input elements are focused
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    if (this.availableRounds.length === 0) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.selectedIndex = Math.min(this.availableRounds.length - 1, this.selectedIndex + 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.availableRounds[this.selectedIndex]) {
          this.onSelectSet(this.availableRounds[this.selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.onOpenContentManager();
        break;
    }
  }

  onSelectSet(round: RoundMetadata): void {
    this.setSelected.emit(round.id);
  }

  onOpenContentManager(): void {
    this.openContentManager.emit();
  }

  isSelected(index: number): boolean {
    return index === this.selectedIndex;
  }

  // Keep backward compatibility
  @Input() set availableSets(sets: string[]) {
    // If old string[] format is used, convert to empty RoundMetadata
    this.availableRounds = sets.map(id => ({ id, name: id, language: 'en', difficulty: 'unknown' } as RoundMetadata));
  }
}