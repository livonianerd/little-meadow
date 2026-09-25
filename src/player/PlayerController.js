import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { heightAt } from '../world/Terrain.js';

export class PlayerController {
  constructor(player, camera, canvas) {
    this.player = player; this.camera = camera; this.canvas = canvas;
    this.keys = new Set(); this.enabled = false; this.yaw = 0; this.pitch = CONFIG.camera.pitch; this.distance = CONFIG.camera.distance;
    this.velocity = new THREE.Vector3(); this.direction = new THREE.Vector3(); this.target = new THREE.Vector3(); this.desired = new THREE.Vector3();
    this.dragging = false;
    window.addEventListener('keydown', e => {
      if (this.enabled && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(e.code)) { e.preventDefault(); this.keys.add(e.code); }
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
    canvas.addEventListener('pointerdown', e => { if (this.enabled && e.button === 0) { this.dragging = true; canvas.setPointerCapture(e.pointerId); } });
    canvas.addEventListener('pointerup', () => this.dragging = false);
    canvas.addEventListener('lostpointercapture', () => this.dragging = false);
    canvas.addEventListener('pointermove', e => {
      if (!this.enabled || !this.dragging) return;
      this.yaw -= e.movementX * 0.005; this.pitch = THREE.MathUtils.clamp(this.pitch + e.movementY * 0.004, 0.12, 0.88);
    });
    canvas.addEventListener('wheel', e => { if (this.enabled) { e.preventDefault(); this.distance = THREE.MathUtils.clamp(this.distance + e.deltaY * 0.012, CONFIG.camera.minDistance, CONFIG.camera.maxDistance); } }, { passive: false });
  }
  clear() { this.keys.clear(); this.dragging = false; this.velocity.set(0, 0, 0); this.player.speed = 0; }
  update(dt) {
    const pressed = (...keys) => keys.some(k => this.keys.has(k));
    const x = Number(pressed('KeyD', 'ArrowRight')) - Number(pressed('KeyA', 'ArrowLeft'));
    const z = Number(pressed('KeyS', 'ArrowDown')) - Number(pressed('KeyW', 'ArrowUp'));
    this.direction.set(this.enabled ? x : 0, 0, this.enabled ? z : 0).normalize().applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.yaw);
    const speed = pressed('ShiftLeft', 'ShiftRight') ? CONFIG.jogSpeed : CONFIG.walkSpeed;
    this.direction.multiplyScalar(speed * (this.player.actionTime > 0 ? 0.25 : 1));
    this.velocity.lerp(this.direction, 1 - Math.exp(-10 * dt));
    const p = this.player.group.position;
    p.addScaledVector(this.velocity, dt);
    // A soft, invisible meadow boundary, well inside the surrounding landscape.
    const limit = CONFIG.worldSize / 2 - 6;
    p.x = THREE.MathUtils.clamp(p.x, -limit, limit); p.z = THREE.MathUtils.clamp(p.z, -limit, limit);
    this.player.speed = this.velocity.length();
    if (this.player.speed > 0.15) {
      const desired = Math.atan2(this.velocity.x, this.velocity.z);
      const delta = Math.atan2(Math.sin(desired - this.player.group.rotation.y), Math.cos(desired - this.player.group.rotation.y));
      this.player.group.rotation.y += delta * (1 - Math.exp(-12 * dt));
    }
    this.target.set(p.x, heightAt(p.x, p.z) + 1.6, p.z);
    this.desired.set(p.x + Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance, this.target.y + Math.sin(this.pitch) * this.distance, p.z + Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance);
    this.desired.y = Math.max(this.desired.y, heightAt(this.desired.x, this.desired.z) + 2);
    this.camera.position.lerp(this.desired, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(this.target);
  }
}
