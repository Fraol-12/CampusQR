const SoundFX = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  playTone(freq, duration, type = 'sine', volume = 0.15) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  success() {
    this.playTone(523, 0.15);
    setTimeout(() => this.playTone(659, 0.2), 100);
  },

  error() {
    this.playTone(200, 0.3, 'square', 0.12);
    setTimeout(() => this.playTone(150, 0.4, 'square', 0.1), 150);
  },

  warning() {
    this.playTone(440, 0.15);
    setTimeout(() => this.playTone(440, 0.15), 200);
  },
};
