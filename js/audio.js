/**
 * CAMISA11 — Football Career & Manager
 * audio.js — Sintetizador Procedural de Efeitos Sonoros com Web Audio API
 */

const SoundEngine = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  // Efeito de apito do árbitro (agudo com oscilação)
  playWhistle(isDouble = false) {
    if (!this.enabled) return;
    this.init();
    this.resumeContext();
    if (!this.ctx) return;

    const playSingle = (time, duration = 0.28) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, time);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(32, time);
      modGain.gain.setValueAtTime(300, time);

      mod.connect(osc.frequency);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      mod.start(time);
      osc.start(time);
      mod.stop(time + duration);
      osc.stop(time + duration);
    };

    const now = this.ctx.currentTime;
    playSingle(now, 0.32);
    if (isDouble) {
      playSingle(now + 0.38, 0.45);
    }
  },

  // Efeito de chute ou passe na bola (grave e impactante)
  playKick(isPower = false) {
    if (!this.enabled) return;
    this.init();
    this.resumeContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isPower ? 240 : 180;
    const endFreq = isPower ? 40 : 35;
    const duration = isPower ? 0.22 : 0.15;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(isPower ? 0.35 : 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  },

  // Efeito de desarme ou carrinho
  playTackle() {
    if (!this.enabled) return;
    this.init();
    this.resumeContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(100, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  },

  // Efeito de celebração de gol (explosão da torcida + buzina triunfante)
  playGoal() {
    if (!this.enabled) return;
    this.init();
    this.resumeContext();
    if (!this.ctx) return;

    this.playWhistle(true);

    const now = this.ctx.currentTime + 0.1;
    // Acorde festivo maior (D - F# - A)
    const notes = [587.33, 739.99, 880.00, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + 1.2);
    });

    // Ruído de torcida rugindo
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const crowd = this.ctx.createBufferSource();
    crowd.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(1.2, now);

    const gainCrowd = this.ctx.createGain();
    gainCrowd.gain.setValueAtTime(0.01, now);
    gainCrowd.gain.linearRampToValueAtTime(0.3, now + 0.3);
    gainCrowd.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    crowd.connect(filter);
    filter.connect(gainCrowd);
    gainCrowd.connect(this.ctx.destination);

    crowd.start(now);
  },

  // Efeito de clique de interface
  playClick() {
    if (!this.enabled) return;
    this.init();
    this.resumeContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  },

  // Efeito de defesa do goleiro (luva espalmando a bola)
  playSave() {
    if (!this.enabled) return;
    this.init();
    this.resumeContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }
};
