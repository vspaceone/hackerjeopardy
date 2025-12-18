import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgStyle } from '@angular/common';
import { Player } from '../../models/game.models';

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.css'],
  standalone: true,
  imports: [NgStyle]
})
export class PlayerControlsComponent {
  @Input() player!: Player;
  @Input() canRename: boolean = false;
  @Input() isActive: boolean = false;
  @Output() rename = new EventEmitter<Player>();
  @Output() scoreAdjust = new EventEmitter<{player: Player, amount: number}>();

  scoreUpdated = false;

  onRename(): void {
    this.rename.emit(this.player);
  }

  onPlus(): void {
    this.triggerScoreAnimation();
    this.scoreAdjust.emit({player: this.player, amount: 100});
  }

  onMinus(): void {
    this.triggerScoreAnimation();
    this.scoreAdjust.emit({player: this.player, amount: -100});
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