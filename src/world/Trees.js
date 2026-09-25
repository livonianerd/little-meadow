import * as THREE from 'three';
import { heightAt } from './Terrain.js';
import { seededRandom } from '../config.js';

export class Trees {
  constructor(scene) {
    const rng = seededRandom(134);
    this.positions = [{ x: -10, z: -8, scale: 1.5 }, { x: 10, z: -7, scale: 1 }, { x: 22, z: 10, scale: 0.9 }, { x: -24, z: 13, scale: 1 }];
    for (let i = 0; i < 210; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = 32 + rng() * 340;
      this.positions.push({ x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, scale: 0.8 + rng() * 1.1 });
    }
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28, 0.52, 5.5, 6), new THREE.MeshStandardMaterial({ color: '#8b7052', roughness: 1 }), this.positions.length);
    const foliage = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(3.5, 1), new THREE.MeshStandardMaterial({ color: '#729c61', roughness: 1, flatShading: true }), this.positions.length * 3);
    const dummy = new THREE.Object3D();
    const colors = ['#739956', '#88a961', '#6f995f', '#9cb56a', '#678b56'];
    this.positions.forEach((p, i) => {
      p.y = heightAt(p.x, p.z);
      dummy.position.set(p.x, p.y + 2.75 * p.scale, p.z);
      dummy.scale.setScalar(p.scale); dummy.rotation.set(0, rng() * 6, 0); dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) {
        dummy.position.set(p.x + (j - 1) * 1.7 * p.scale, p.y + (5.5 + (j === 1 ? 1.9 : 0)) * p.scale, p.z + (j === 1 ? -0.6 : 0.3) * p.scale);
        dummy.scale.set(1.05 * p.scale, (j === 1 ? 1 : 0.85) * p.scale, p.scale);
        dummy.updateMatrix(); foliage.setMatrixAt(i * 3 + j, dummy.matrix);
        foliage.setColorAt(i * 3 + j, new THREE.Color(colors[i % colors.length]));
      }
    });
    trunk.castShadow = true; foliage.castShadow = true; foliage.receiveShadow = true;
    scene.add(trunk, foliage);
  }
}
