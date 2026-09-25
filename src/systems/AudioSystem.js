// Entirely synthesized: no missing files, network requests, or autoplay audio.
export class AudioSystem {
  constructor(muted = false) { this.muted = muted; this.context = null; this.nextBird = 3; this.stepTime = 0; this.active = false; }
  async start() {
    try {
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.context = new AudioContext(); this.master = this.context.createGain(); this.master.gain.value = this.muted ? 0 : 0.3; this.master.connect(this.context.destination);
        const buffer = this.context.createBuffer(1, this.context.sampleRate * 3, this.context.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const source = this.context.createBufferSource(); source.buffer = buffer; source.loop = true;
        const filter = this.context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420;
        const gain = this.context.createGain(); gain.gain.value = 0.045; source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start();
      }
      this.active = true; await this.context.resume();
    } catch (error) { console.warn('Optional meadow audio is unavailable:', error.message); }
  }
  pause() { this.active = false; this.context?.suspend().catch(() => {}); }
  setMuted(value) { this.muted = value; if (this.master) this.master.gain.setTargetAtTime(value ? 0 : 0.3, this.context.currentTime, 0.08); }
  tone(frequency, duration, volume = 0.15, delay = 0, endFrequency = frequency) {
    if (!this.context || this.muted || !this.active) return;
    const start = this.context.currentTime + delay, osc = this.context.createOscillator(), gain = this.context.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, start); osc.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + 0.015); gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain); gain.connect(this.master); osc.start(start); osc.stop(start + duration + 0.02); osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  play(name) {
    if (name === 'flower') { this.tone(660, 0.24, 0.11); this.tone(880, 0.3, 0.08, 0.1); }
    if (name === 'acorn') this.tone(400, 0.14, 0.13, 0, 650);
    if (name === 'kindness') [523, 659, 784].forEach((f, i) => this.tone(f, 0.6, 0.1, i * 0.12));
    if (name === 'squirrel') { this.tone(1300, 0.08, 0.045, 0, 1900); this.tone(1500, 0.08, 0.04, 0.13, 1800); }
    if (name === 'bird') { this.tone(1700, 0.2, 0.05, 0, 2400); this.tone(2100, 0.15, 0.04, 0.24, 1600); }
    if (name === 'footstep') this.tone(115, 0.07, 0.065, 0, 65);
  }
  update(dt, speed) {
    if (!this.active) return;
    this.nextBird -= dt; if (this.nextBird <= 0) { this.play('bird'); this.nextBird = 5 + Math.random() * 8; }
    this.stepTime -= dt; if (speed > 0.5 && this.stepTime <= 0) { this.play('footstep'); this.stepTime = speed > 6 ? 0.28 : 0.42; }
  }
}
