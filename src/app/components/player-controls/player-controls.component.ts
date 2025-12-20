import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../../models/game.models';
import { PLAYER_CONFIG, TIMING } from '../../constants/game.constants';

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
  @Output() renamingStateChange = new EventEmitter<boolean>();

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
    this.renamingStateChange.emit(true);
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
      this.player.name = this.player.name;
    }
    this.isRenaming = false;
    this.renamingStateChange.emit(false);
  }

  cancelRename(): void {
    this.isRenaming = false;
    this.renamingStateChange.emit(false);
  }

  onPlus(): void {
    this.triggerScoreAnimation();
    this.scoreAdjust.emit({ player: this.player, amount: PLAYER_CONFIG.SCORE_INCREMENT });
  }

  onMinus(): void {
    this.triggerScoreAnimation();
    this.scoreAdjust.emit({ player: this.player, amount: -PLAYER_CONFIG.SCORE_INCREMENT });
  }

  private triggerScoreAnimation(): void {
    this.scoreUpdated = true;
    setTimeout(() => this.scoreUpdated = false, TIMING.SCORE_ANIMATION_DURATION);
  }

  getPlayerStyle(): any {
    return {
      'color': this.player.fgcolor,
      'border-color': this.player.fgcolor
    };
  }
}