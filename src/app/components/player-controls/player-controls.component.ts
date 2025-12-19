import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../../models/game.models';

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PlayerControlsComponent implements AfterViewInit {
  @Input() player!: Player;
  @Input() canRename = false;
  @Input() isActive = false;
  @Input() highlighted = false;

  @Output() rename = new EventEmitter<Player>();
  @Output() scoreAdjust = new EventEmitter<{ player: Player; amount: number }>();

  isRenaming = false;
  newName = '';
  scoreUpdated = false;

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  onRename(): void {
    this.startRename();
  }

  startRename(): void {
    this.isRenaming = true;
    this.newName = this.player.name;
    // Focus the input after the view updates
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
        this.nameInput.nativeElement.select();
      }
    }, 0);
  }

  ngAfterViewInit(): void {
    // Interface implementation
  }

  saveRename(): void {
    if (this.newName.trim()) {
      this.player.name = this.newName.trim();
    }
    this.isRenaming = false;
  }

  cancelRename(): void {
    this.isRenaming = false;
  }

  onPlus(): void {
    this.triggerScoreAnimation();
    this.scoreAdjust.emit({ player: this.player, amount: 100 });
  }

  onMinus(): void {
    this.triggerScoreAnimation();
    this.scoreAdjust.emit({ player: this.player, amount: -100 });
  }

  private triggerScoreAnimation(): void {
    this.scoreUpdated = true;
    setTimeout(() => this.scoreUpdated = false, 600);
  }

  getPlayerStyle(): any {
    return {
      'color': this.player.fgcolor,
      'border-color': this.player.fgcolor
    };
  }
}