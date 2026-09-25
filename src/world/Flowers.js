import * as THREE from 'three';
import { Collectibles, coloredGeometry, mergeGeometries } from './Collectibles.js';
import { CONFIG, random } from '../config.js';

export class Flowers extends Collectibles {
  constructor(scene) {
    const geometries = ['#fff3d9', '#f3cc64', '#82abcf', '#ad88be', '#d97968'].map(color => {
      const parts = [coloredGeometry(new THREE.CylinderGeometry(0.025, 0.03, 0.65, 4), '#597e46', 0, 0.32, 0)];
      const leaf = new THREE.SphereGeometry(0.14, 5, 4); leaf.scale(1.5, 0.25, 0.6); leaf.rotateZ(0.5); parts.push(coloredGeometry(leaf, '#618950', 0.12, 0.28, 0));
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2, petal = new THREE.SphereGeometry(0.14, 5, 4); petal.scale(1, 0.4, 1.5); petal.rotateY(-a);
        parts.push(coloredGeometry(petal, color, Math.sin(a) * 0.14, 0.68, Math.cos(a) * 0.14));
      }
      parts.push(coloredGeometry(new THREE.SphereGeometry(0.09, 6, 4), '#edbb51', 0, 0.72, 0));
      const merged = mergeGeometries(parts); parts.forEach(p => p.dispose()); return merged;
    });
    super(scene, CONFIG.flowerCount, geometries, CONFIG.flowerRespawn, (i, player) => {
      if (i === 0) return { x: -1.3, z: 4.6 };
      if (i === 1) return { x: 2, z: 1.5 };
      if (i === 2) return { x: -5, z: -1 };
      const a = random(0, Math.PI * 2), radius = i < 85 ? random(5, 42) : random(20, 280);
      if (i === -1 && player && Math.random() < 0.7) return { x: THREE.MathUtils.clamp(player.x + Math.sin(a) * random(8, 28), -285, 285), z: THREE.MathUtils.clamp(player.z + Math.cos(a) * random(8, 28), -285, 285) };
      return { x: Math.sin(a) * radius, z: Math.cos(a) * radius };
    });
    for (const item of this.items) { item.type = 'flowers'; item.label = 'Pick flower'; }
  }
}
