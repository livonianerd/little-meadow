import * as THREE from 'three';
import { heightAt } from '../world/Terrain.js';
import { random } from '../config.js';
const fur = new THREE.MeshStandardMaterial({ color: '#a77b50', roughness: 1, flatShading: true });
const belly = new THREE.MeshStandardMaterial({ color: '#e4c69a', roughness: 1 });
const dark = new THREE.MeshStandardMaterial({ color: '#40392e' });
export class Squirrel {
  constructor(scene, x, z) {
    this.group = new THREE.Group(); this.group.position.set(x, heightAt(x, z), z); this.position = this.group.position; this.home = this.position.clone();
    this.kind = 'squirrel'; this.active = true; this.state = 'idle'; this.remaining = random(1, 5); this.phase = random(0, 6); this.target = this.position.clone();
    const part = (r, mat, x, y, z, sx = 1, sy = 1, sz = 1, parent = this.group) => {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); mesh.castShadow = true; parent.add(mesh); return mesh;
    };
    part(0.34, fur, 0, 0.43, 0, 1, 1.35, 0.85); part(0.23, belly, 0, 0.42, 0.2, 0.9, 1.2, 0.55);
    part(0.26, fur, 0, 0.89, 0.1); part(0.12, belly, 0, 0.82, 0.32, 1, 0.65, 1);
    part(0.045, dark, 0, 0.86, 0.42);
    for (const side of [-1, 1]) {
      part(0.065, dark, side * 0.17, 0.93, 0.27, 0.65, 1, 0.6); part(0.1, fur, side * 0.18, 1.12, 0.05, 0.8, 1.4, 0.6);
      part(0.12, fur, side * 0.2, 0.1, 0.16, 1, 0.6, 1.5); part(0.085, fur, side * 0.2, 0.49, 0.28, 0.8, 1.2, 0.8);
    }
    this.tail = new THREE.Group(); this.tail.position.set(0, 0.23, -0.2); this.group.add(this.tail);
    part(0.33, fur, 0, 0.46, -0.35, 0.9, 1.7, 1, this.tail); part(0.27, fur, 0, 0.87, -0.3, 0.9, 1.2, 1, this.tail);
    this.group.scale.setScalar(1.15); scene.add(this.group);
  }
  receive(playerPosition) {
    this.state = 'approach'; this.remaining = 0.7;
    this.target.copy(this.position).lerp(playerPosition, 0.3);
    this.group.rotation.y = Math.atan2(playerPosition.x - this.position.x, playerPosition.z - this.position.z);
  }
  update(dt, time) {
    this.remaining -= dt;
    if (this.remaining <= 0) {
      if (this.state === 'approach') { this.state = 'nibble'; this.remaining = 2; }
      else if (this.state === 'nibble') {
        this.state = 'scamper'; this.remaining = 1.5;
        this.target.set(this.home.x + random(-4, 4), 0, this.home.z + random(-4, 4));
      } else if (this.state === 'idle') {
        this.state = 'wander'; this.remaining = random(2, 4); this.target.set(this.home.x + random(-3, 3), 0, this.home.z + random(-3, 3));
      } else { this.state = 'idle'; this.remaining = random(3, 7); }
    }
    const moving = ['approach', 'scamper', 'wander'].includes(this.state);
    if (moving) {
      const dx = this.target.x - this.position.x, dz = this.target.z - this.position.z, distance = Math.hypot(dx, dz);
      if (distance > 0.12) {
        const step = Math.min(distance, dt * (this.state === 'scamper' ? 4 : this.state === 'approach' ? 1.2 : 0.8));
        this.position.x += dx / distance * step; this.position.z += dz / distance * step; this.group.rotation.y = Math.atan2(dx, dz);
      }
    }
    this.position.y = heightAt(this.position.x, this.position.z) + (moving ? Math.abs(Math.sin(time * 12 + this.phase)) * 0.1 : 0);
    this.tail.rotation.z = Math.sin(time * (this.state === 'nibble' ? 13 : 2) + this.phase) * (this.state === 'nibble' ? 0.45 : 0.1);
    this.tail.rotation.x = Math.sin(time * 3 + this.phase) * 0.1;
  }
  get available() { return this.state === 'idle' || this.state === 'wander'; }
}
