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
  private audioContext: AudioContext | null = null;

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

    // Initialize Web Audio API for buzzer sound
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported, using fallback sounds');
    }
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

  playBuzzer(): void {
    if (!this.audioContext) {
      // Fallback to click sound if Web Audio API not available
      this.clicksound.play();
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Buzzer characteristics: quick descending sweep for buzzing in
      const startFrequency = 600; // Start mid-high
      const endFrequency = 150;   // End low
      const duration = 0.6;       // 600ms duration

      oscillator.frequency.setValueAtTime(startFrequency, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, this.audioContext.currentTime + duration);

      // Envelope for attention-grabbing sound
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.type = 'sawtooth'; // Harsh, electronic buzzer sound

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

    } catch (error) {
      // Fallback if something goes wrong
      this.clicksound.play();
    }
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