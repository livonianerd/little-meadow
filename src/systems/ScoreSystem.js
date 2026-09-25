import { CONFIG } from '../config.js';
export class ScoreSystem {
  constructor(saved = {}) { this.kindness = saved.kindness ?? 0; this.flowersGiven = saved.flowersGiven ?? 0; this.squirrelsFed = saved.squirrelsFed ?? 0; }
  reward(type) {
    if (type === 'flower') { this.flowersGiven++; this.kindness += CONFIG.rewards.flower; return CONFIG.rewards.flower; }
    if (type === 'acorn') { this.squirrelsFed++; this.kindness += CONFIG.rewards.acorn; return CONFIG.rewards.acorn; }
    return 0;
  }
  reset() { this.kindness = 0; this.flowersGiven = 0; this.squirrelsFed = 0; }
}
