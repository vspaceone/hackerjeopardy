import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private clicksound: Howl;
  private successsound: Howl;
  private failsound: Howl;
  private clocksound: Howl;
  private themeAudio: HTMLAudioElement;
  private audiotimer: number | null = null;

  constructor() {
    this.clicksound = new Howl({
      src: ['assets/click.mp3']
    });
    
    this.successsound = new Howl({
      src: ['assets/success_notification.mp3']
    });
    
    this.failsound = new Howl({
      src: ['assets/fail_notification.mp3']
    });
    
    this.clocksound = new Howl({
      src: ['assets/clock.mp3']
    });

    this.themeAudio = new Audio('assets/theme.mp3');
    this.themeAudio.loop = true;
    this.themeAudio.preload = 'none';
  }

  playClick(): void {
    this.clicksound.play();
  }

  playSuccess(): void {
    this.successsound.play();
  }

  playFail(): void {
    this.failsound.play();
  }

  playClock(): void {
    this.clocksound.play();
  }

  startThemeMusic(): void {
    this.audiotimer = window.setTimeout(() => {
      this.themeAudio.play();
    }, 5000);
  }

  stopThemeMusic(): void {
    if (this.audiotimer) {
      clearTimeout(this.audiotimer);
      this.audiotimer = null;
    }
    this.themeAudio.pause();
    this.themeAudio.load();
  }
}