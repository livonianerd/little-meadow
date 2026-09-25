export class Inventory {
  constructor(saved = {}) { this.flowers = saved.flowers ?? 0; this.acorns = saved.acorns ?? 0; }
  add(type) { if (type === 'flowers' || type === 'acorns') this[type]++; }
  take(type) { if ((type === 'flowers' || type === 'acorns') && this[type] > 0) { this[type]--; return true; } return false; }
  reset() { this.flowers = 0; this.acorns = 0; }
}
