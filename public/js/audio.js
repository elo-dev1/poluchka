/**
 * Web Audio API procedural sound engine (no external audio files needed)
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type, duration, gainValue = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Dice roll rattle
  playDiceRoll() {
    if (this.muted) return;
    this.init();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const freq = 120 + Math.random() * 200;
        this.playTone(freq, 'triangle', 0.05, 0.08);
      }, i * 50);
    }
  }

  // Token hop sound
  playStep() {
    this.playTone(350 + Math.random() * 50, 'sine', 0.06, 0.06);
  }

  // Buy property sound
  playBuy() {
    if (this.muted) return;
    this.init();
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.08);
      }, i * 70);
    });
  }

  // Rent payment sound
  playCash() {
    if (this.muted) return;
    this.init();
    const notes = [587, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.12, 0.07);
      }, i * 60);
    });
  }

  // Tax penalty sound
  playTax() {
    if (this.muted) return;
    this.init();
    const notes = [300, 240, 180];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.15, 0.05);
      }, i * 90);
    });
  }

  // Card drawn jingle
  playCard() {
    if (this.muted) return;
    this.init();
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.07);
      }, i * 80);
    });
  }

  // Jail buzzer
  playJail() {
    if (this.muted) return;
    this.init();
    this.playTone(130, 'sawtooth', 0.4, 0.12);
  }

  // Bankruptcy buzzer
  playBankrupt() {
    if (this.muted) return;
    this.init();
    const notes = [260, 220, 180, 130];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.09);
      }, i * 120);
    });
  }

  // Victory fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.35, 0.1);
      }, i * 130);
    });
  }
}

window.soundEngine = new SoundEngine();
