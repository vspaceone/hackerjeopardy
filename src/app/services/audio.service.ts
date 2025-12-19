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
  private isPlayingBuzzer = false;

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

  playBuzzer(playerId: number = 1): void {
    if (!this.audioContext || this.isPlayingBuzzer) {
      return;
    }

    // Ensure audio context is running
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlayingBuzzer = true;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Unique buzzer characteristics per player
      const playerIndex = Math.max(0, Math.min(3, playerId - 1)); // Clamp to 0-3

      const startFrequencies = [800, 700, 600, 500];
      const endFrequencies = [200, 180, 160, 140];
      const durations = [0.4, 0.5, 0.6, 0.5];
      const waveforms: OscillatorType[] = ['sawtooth', 'square', 'sawtooth', 'square'];

      const startFrequency = startFrequencies[playerIndex];
      const endFrequency = endFrequencies[playerIndex];
      const duration = durations[playerIndex];
      const waveform = waveforms[playerIndex];

      oscillator.frequency.setValueAtTime(startFrequency, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, this.audioContext.currentTime + duration);

      // Envelope for attention-grabbing sound
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.type = waveform;

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      // Reset flag after sound completes
      setTimeout(() => {
        this.isPlayingBuzzer = false;
      }, duration * 1000 + 100);

    } catch (error) {
      console.warn('Buzzer sound failed:', error);
      this.isPlayingBuzzer = false;
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