const KEY = 'little-meadow:save:v1';
const FIELDS = ['kindness', 'flowersGiven', 'squirrelsFed', 'flowers', 'acorns'];
export class SaveSystem {
  constructor(storage = globalThis.localStorage) { this.storage = storage; this.available = true; }
  load() {
    try {
      const raw = JSON.parse(this.storage.getItem(KEY) || '{}');
      const data = {};
      for (const key of FIELDS) data[key] = Number.isSafeInteger(raw?.[key]) && raw[key] >= 0 ? raw[key] : 0;
      data.muted = raw?.muted === true;
      return data;
    } catch { this.available = false; return {}; }
  }
  save(inventory, score, muted) {
    try { this.storage.setItem(KEY, JSON.stringify({ version: 1, flowers: inventory.flowers, acorns: inventory.acorns, kindness: score.kindness, flowersGiven: score.flowersGiven, squirrelsFed: score.squirrelsFed, muted })); return true; }
    catch { if (this.available) console.warn('Progress could not be saved. This browser may have disabled localStorage.'); this.available = false; return false; }
  }
}
