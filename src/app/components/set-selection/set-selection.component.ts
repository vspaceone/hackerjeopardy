import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-selection',
  templateUrl: './set-selection.component.html',
  styleUrls: ['./set-selection.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SetSelectionComponent {
  @Input() availableSets: string[] = [];
  @Output() setSelected = new EventEmitter<string>();

  onSelectSet(setName: string): void {
    this.setSelected.emit(setName);
  }
}