import { CONFIG } from '../config.js';
export class InteractionSystem {
  constructor(inventory, objects) { this.inventory = inventory; this.objects = objects; this.current = null; }
  labelFor(object) {
    if (!object.active) return '';
    if (object.kind === 'collectible') return object.label;
    if (object.kind === 'mom' && this.inventory.flowers > 0) return 'Give flower to Mom';
    if (object.kind === 'squirrel' && this.inventory.acorns > 0 && object.available) return 'Give acorn to squirrel';
    return '';
  }
  update(position) {
    let nearest = null, distance = CONFIG.interactionRadius ** 2;
    for (const object of this.objects) {
      if (!this.labelFor(object)) continue;
      const dx = position.x - object.position.x, dz = position.z - object.position.z, d = dx * dx + dz * dz;
      if (d < distance) { nearest = object; distance = d; }
    }
    this.current = nearest;
    return nearest ? this.labelFor(nearest) : '';
  }
}
