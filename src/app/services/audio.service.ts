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
      const playerIndex = Math.max(0, Math.min(7, playerId - 1)); // Support 8 players (0-7)

      // Different synthesis approaches for maximum distinguishability
      switch (playerIndex) {
        case 0: // Player 1: Classic descending sweep
          this.createClassicSweep(800, 200, 0.4, 'sawtooth');
          break;
        case 1: // Player 2: Pulsing square wave
          this.createPulsingSquare(700, 0.5);
          break;
        case 2: // Player 3: Harmonic-rich triangle
          this.createHarmonicTriangle(600, 0.6);
          break;
        case 3: // Player 4: Deep resonant tone
          this.createResonantTone(300, 0.5);
          break;
        case 4: // Player 5: Fast trilling sound (more audible)
          this.createTrillSound(650, 0.4);
          break;
        case 5: // Player 6: Dual-tone chord (more audible)
          this.createDualToneChord(400, 500, 0.6);
          break;
        case 6: // Player 7: Modulated warble (more audible)
          this.createModulatedWarble(550, 0.5);
          break;
        case 7: // Player 8: Burst sequence (more audible)
          this.createBurstSequence(750, 0.45);
          break;
      }

    } catch (error) {
      console.warn('Buzzer sound failed:', error);
      this.isPlayingBuzzer = false;
    }
  }

  // Player 1: Classic descending frequency sweep
  private createClassicSweep(startFreq: number, endFreq: number, duration: number, waveform: OscillatorType): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(startFreq, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext!.currentTime + duration);

    gainNode.gain.setValueAtTime(0.25, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

    oscillator.type = waveform;
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 2: Pulsing square wave with rhythmic variation
  private createPulsingSquare(baseFreq: number, duration: number): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext!.currentTime);

    // Add some frequency modulation for character
    const now = this.audioContext!.currentTime;
    oscillator.frequency.setValueAtTime(baseFreq, now);
    oscillator.frequency.setValueAtTime(baseFreq * 1.1, now + 0.1);
    oscillator.frequency.setValueAtTime(baseFreq, now + 0.2);
    oscillator.frequency.setValueAtTime(baseFreq * 1.05, now + 0.3);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.setValueAtTime(0.3, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.type = 'square';
    oscillator.start(now);
    oscillator.stop(now + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 3: Harmonic-rich triangle wave
  private createHarmonicTriangle(baseFreq: number, duration: number): void {
    const oscillator1 = this.audioContext!.createOscillator();
    const oscillator2 = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    const filterNode = this.audioContext!.createBiquadFilter();

    oscillator1.connect(filterNode);
    oscillator2.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    // Fundamental and octave
    oscillator1.frequency.setValueAtTime(baseFreq, this.audioContext!.currentTime);
    oscillator2.frequency.setValueAtTime(baseFreq * 2, this.audioContext!.currentTime);

    // Low-pass filter for warmth
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, this.audioContext!.currentTime);

    gainNode.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

    oscillator1.type = 'triangle';
    oscillator2.type = 'triangle';

    const now = this.audioContext!.currentTime;
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + duration);
    oscillator2.stop(now + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 4: Deep resonant tone with filter sweep (increased volume)
  private createResonantTone(baseFreq: number, duration: number): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    const filterNode = this.audioContext!.createBiquadFilter();

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext!.currentTime);

    // Bandpass filter sweep for resonance - adjusted for better audibility
    filterNode.type = 'bandpass';
    filterNode.Q.setValueAtTime(5, this.audioContext!.currentTime); // Lower Q for broader passband
    filterNode.frequency.setValueAtTime(baseFreq * 1.5, this.audioContext!.currentTime); // Start closer to fundamental
    filterNode.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, this.audioContext!.currentTime + duration);

    // Increased volume for better audibility
    gainNode.gain.setValueAtTime(0.35, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

    oscillator.type = 'sawtooth';
    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 5: Fast trilling sound (more audible than high pitch)
  private createTrillSound(baseFreq: number, duration: number): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    const lfo = this.audioContext!.createOscillator();
    const lfoGain = this.audioContext!.createGain();

    // LFO for frequency modulation (trill effect)
    lfo.frequency.setValueAtTime(20, this.audioContext!.currentTime); // 20Hz modulation
    lfoGain.gain.setValueAtTime(baseFreq * 0.1, this.audioContext!.currentTime); // 10% modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext!.currentTime);

    gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

    oscillator.type = 'square';
    lfo.type = 'sine';

    const now = this.audioContext!.currentTime;
    oscillator.start(now);
    lfo.start(now);
    oscillator.stop(now + duration);
    lfo.stop(now + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 6: Dual-tone chord (more audible than low sine)
  private createDualToneChord(freq1: number, freq2: number, duration: number): void {
    const oscillator1 = this.audioContext!.createOscillator();
    const oscillator2 = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator1.frequency.setValueAtTime(freq1, this.audioContext!.currentTime);
    oscillator2.frequency.setValueAtTime(freq2, this.audioContext!.currentTime);

    // Create a chord-like effect with slight detuning
    oscillator2.frequency.setValueAtTime(freq2 * 1.01, this.audioContext!.currentTime);

    gainNode.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

    oscillator1.type = 'triangle';
    oscillator2.type = 'triangle';

    const now = this.audioContext!.currentTime;
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + duration);
    oscillator2.stop(now + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 7: Modulated warble (more audible than low tones)
  private createModulatedWarble(baseFreq: number, duration: number): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    const lfo = this.audioContext!.createOscillator();
    const lfoGain = this.audioContext!.createGain();

    // Slower LFO for warbling effect
    lfo.frequency.setValueAtTime(8, this.audioContext!.currentTime); // 8Hz modulation
    lfoGain.gain.setValueAtTime(baseFreq * 0.15, this.audioContext!.currentTime); // 15% modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext!.currentTime);

    gainNode.gain.setValueAtTime(0.25, this.audioContext!.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

    oscillator.type = 'sawtooth';
    lfo.type = 'sine';

    const now = this.audioContext!.currentTime;
    oscillator.start(now);
    lfo.start(now);
    oscillator.stop(now + duration);
    lfo.stop(now + duration);

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
  }

  // Player 8: Burst sequence (more audible than single burst)
  private createBurstSequence(baseFreq: number, duration: number): void {
    const now = this.audioContext!.currentTime;
    const burstDuration = 0.08; // Short bursts
    const numBursts = 4;
    const interval = duration / numBursts;

    for (let i = 0; i < numBursts; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext!.currentTime);
        oscillator.frequency.setValueAtTime(baseFreq * 1.2, this.audioContext!.currentTime + burstDuration * 0.5);

        gainNode.gain.setValueAtTime(0.4, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + burstDuration);

        oscillator.type = 'square';
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + burstDuration);
      }, i * interval * 1000);
    }

    setTimeout(() => { this.isPlayingBuzzer = false; }, duration * 1000 + 100);
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