import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundMetadata } from '../../services/content/content.types';

@Component({
  selector: 'app-set-selection',
  templateUrl: './set-selection.component.html',
  styleUrls: ['./set-selection.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SetSelectionComponent {
  @Input() availableRounds: RoundMetadata[] = [];
  @Output() setSelected = new EventEmitter<string>();

  onSelectSet(round: RoundMetadata): void {
    this.setSelected.emit(round.id);
  }

  // Keep backward compatibility
  @Input() set availableSets(sets: string[]) {
    // If old string[] format is used, convert to empty RoundMetadata
    this.availableRounds = sets.map(id => ({ id, name: id, language: 'en', difficulty: 'unknown' } as RoundMetadata));
  }
}