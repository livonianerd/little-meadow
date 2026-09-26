import * as THREE from 'three';
import { coloredGeometry, mergeGeometries } from '../world/Collectibles.js';

const PALETTE = ['#fff3d9', '#f3cc64', '#82abcf', '#ad88be', '#d97968'];
const STAGES = [
  { min: 1, count: 2, radius: 0.08 },
  { min: 3, count: 4, radius: 0.17 },
  { min: 6, count: 7, radius: 0.25 },
  { min: 11, count: 11, radius: 0.33 },
  { min: 21, count: 16, radius: 0.41 },
];

// One merged mesh, rebuilt only at a fullness boundary. Gift totals remain in ScoreSystem.
export class MomBouquet {
  constructor(hand) {
    this.group = new THREE.Group();
    this.group.position.set(-0.04, -0.62, 0.07);
    hand.add(this.group);
    this.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });
    this.stage = -1;
    this.update(0);
  }

  update(total) {
    const stage = STAGES.filter(s => total >= s.min).length;
    if (stage === this.stage) return;
    this.stage = stage;
    if (this.mesh) {
      this.group.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh = null;
    }
    this.group.visible = stage > 0;
    if (!stage) return;
    const { count, radius } = STAGES[stage - 1];
    const parts = [];
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963;
      const r = radius * Math.sqrt(i / Math.max(1, count - 1));
      const top = new THREE.Vector3(Math.cos(angle) * r - 0.14, 0.48 + 0.1 * (1 - r / radius), Math.sin(angle) * r + 0.14);
      const bottom = new THREE.Vector3(0, -0.12, 0);
      const direction = top.clone().sub(bottom);
      const stem = new THREE.CylinderGeometry(0.012, 0.016, direction.length(), 4);
      stem.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()));
      const middle = top.clone().add(bottom).multiplyScalar(0.5);
      parts.push(coloredGeometry(stem, '#597e46', middle.x, middle.y, middle.z));
      const leaf = new THREE.SphereGeometry(0.1, 5, 4);
      leaf.scale(1.5, 0.25, 0.65); leaf.rotateZ(i % 2 ? -0.5 : 0.5); leaf.rotateY(angle);
      parts.push(coloredGeometry(leaf, '#618950', top.x * 0.65, 0.24, top.z * 0.65));
      for (let p = 0; p < 5; p++) {
        const a = p * Math.PI * 2 / 5;
        const petal = new THREE.SphereGeometry(0.075, 5, 4);
        petal.scale(1, 0.45, 1.5); petal.rotateY(-a);
        parts.push(coloredGeometry(petal, PALETTE[i % PALETTE.length], top.x + Math.sin(a) * 0.08, top.y, top.z + Math.cos(a) * 0.08));
      }
      parts.push(coloredGeometry(new THREE.SphereGeometry(0.05, 6, 4), '#edbb51', top.x, top.y + 0.025, top.z));
    }
    const ribbon = new THREE.TorusGeometry(0.055, 0.018, 4, 8);
    ribbon.rotateX(Math.PI / 2);
    parts.push(coloredGeometry(ribbon, '#c97055'));
    const geometry = mergeGeometries(parts);
    parts.forEach(part => part.dispose());
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);
  }
}
