import * as THREE from 'three';
import { Collectibles, coloredGeometry, mergeGeometries } from './Collectibles.js';
import { CONFIG, random } from '../config.js';
export class Nuts extends Collectibles {
  constructor(scene, trees) {
    const body = new THREE.SphereGeometry(0.19, 7, 6); body.scale(1, 1.3, 1);
    const parts = [coloredGeometry(body, '#ad7444', 0, 0.22, 0), coloredGeometry(new THREE.SphereGeometry(0.21, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), '#725439', 0, 0.31, 0), coloredGeometry(new THREE.CylinderGeometry(0.025, 0.035, 0.13, 4), '#675039', 0, 0.52, 0)];
    super(scene, CONFIG.acornCount, [mergeGeometries(parts)], CONFIG.acornRespawn, i => {
      if (i === 0) return { x: 5, z: 1 };
      if (i === 1) return { x: 8, z: -3 };
      const tree = trees.positions[i < 35 && i >= 0 ? i % 4 : Math.floor(random(0, trees.positions.length))];
      const angle = random(0, Math.PI * 2), radius = random(2, 5);
      return { x: THREE.MathUtils.clamp(tree.x + Math.sin(angle) * radius, -285, 285), z: THREE.MathUtils.clamp(tree.z + Math.cos(angle) * radius, -285, 285) };
    });
    parts.forEach(p => p.dispose());
    for (const item of this.items) { item.type = 'acorns'; item.label = 'Pick up acorn'; }
  }
}
