import * as THREE from 'three';
import { heightAt } from '../world/Terrain.js';

const skin = new THREE.MeshStandardMaterial({ color: '#eac29b', roughness: 1 });
const hair = new THREE.MeshStandardMaterial({ color: '#624936', roughness: 1 });
const shoe = new THREE.MeshStandardMaterial({ color: '#795640', roughness: 1 });
export function createPerson({ adult = false } = {}) {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: adult ? '#dfb16e' : '#c97055', roughness: 1 });
  const cream = new THREE.MeshStandardMaterial({ color: '#f2e9cc', roughness: 1 });
  function part(geometry, material, x, y, z, parent = group) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  part(new THREE.CylinderGeometry(0.32, 0.5, 0.85, 8), cloth, 0, 1.15, 0);
  part(new THREE.SphereGeometry(0.26, 8, 6), cream, 0, 1.55, 0);
  part(new THREE.SphereGeometry(0.37, 12, 10), skin, 0, 1.94, 0);
  part(new THREE.SphereGeometry(0.385, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58), hair, 0, 2.02, -0.025);
  part(new THREE.SphereGeometry(0.29, 8, 6), hair, 0, 1.86, -0.2);
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#483d35' });
  for (const side of [-1, 1]) {
    part(new THREE.SphereGeometry(0.032, 6, 5), eyeMat, side * 0.13, 1.97, 0.337);
    part(new THREE.SphereGeometry(0.065, 6, 5), new THREE.MeshStandardMaterial({ color: '#db9b83' }), side * 0.23, 1.86, 0.28);
    if (!adult) {
      const pigtail = part(new THREE.SphereGeometry(0.18, 7, 6), hair, side * 0.36, 1.83, -0.06); pigtail.scale.y = 1.5;
      part(new THREE.SphereGeometry(0.1, 6, 5), cream, side * 0.39, 2, -0.035);
    }
  }
  if (adult) part(new THREE.SphereGeometry(0.23, 8, 6), hair, 0, 2.16, -0.24);
  const arms = [], legs = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side * 0.36, 1.48, 0); arm.rotation.z = side * 0.12; group.add(arm);
    part(new THREE.CylinderGeometry(0.115, 0.1, 0.35, 6), cream, side * 0.035, -0.14, 0, arm);
    part(new THREE.CylinderGeometry(0.09, 0.075, 0.35, 6), skin, side * 0.04, -0.43, 0, arm);
    part(new THREE.SphereGeometry(0.095, 6, 6), skin, side * 0.04, -0.62, 0, arm); arms.push(arm);
    const leg = new THREE.Group(); leg.position.set(side * 0.2, 0.77, 0); group.add(leg);
    part(new THREE.CylinderGeometry(0.095, 0.08, 0.57, 6), skin, 0, -0.27, 0, leg);
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 6), cream, 0, -0.53, 0, leg);
    const foot = part(new THREE.SphereGeometry(0.13, 7, 6), shoe, 0, -0.65, 0.07, leg); foot.scale.set(1, 0.7, 1.65); legs.push(leg);
  }
  if (adult) group.scale.setScalar(1.22);
  return { group, arms, legs };
}
export class Player {
  constructor(scene) {
    Object.assign(this, createPerson()); scene.add(this.group);
    this.group.position.set(0, heightAt(0, 6), 6); this.group.rotation.y = Math.PI;
    this.speed = 0; this.phase = 0; this.action = null; this.actionTime = 0;
  }
  animateAction(type) { this.action = type; this.actionTime = 0.9; }
  update(dt, time) {
    this.phase += dt * (this.speed > 6 ? 12 : 8);
    const walk = Math.min(1, this.speed / 4);
    const stride = Math.sin(this.phase) * 0.6 * walk;
    this.legs[0].rotation.x = stride; this.legs[1].rotation.x = -stride;
    this.arms[0].rotation.x = -stride * 0.8; this.arms[1].rotation.x = stride * 0.8;
    this.group.position.y = heightAt(this.group.position.x, this.group.position.z) + Math.abs(Math.cos(this.phase)) * 0.06 * walk + Math.sin(time * 2) * 0.015;
    this.group.rotation.x = 0;
    if (this.actionTime > 0) {
      this.actionTime = Math.max(0, this.actionTime - dt);
      const motion = Math.sin((1 - this.actionTime / 0.9) * Math.PI);
      if (this.action === 'pickup') { this.group.rotation.x = motion * 0.55; this.arms[1].rotation.x = -motion * 0.8; }
      else { this.arms[0].rotation.x = -motion * 1.2; this.arms[1].rotation.x = -motion * 1.2; }
    }
  }
}
