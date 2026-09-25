import * as THREE from 'three';
import { createPerson } from '../player/Player.js';
import { heightAt } from '../world/Terrain.js';
export class Mom {
  constructor(scene) {
    Object.assign(this, createPerson({ adult: true })); this.group.position.set(-6, heightAt(-6, -6), -6); this.group.rotation.y = 0.3;
    this.position = this.group.position; this.kind = 'mom'; this.active = true; this.happyTime = 0; this.helloCooldown = 0;
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 7, 5), new THREE.MeshStandardMaterial({ color: '#f4d185' }));
    flower.position.set(0.1, -0.65, 0.08); this.arms[0].add(flower); this.giftFlower = flower; flower.visible = false;
    scene.add(this.group);
  }
  receive(playerPosition) {
    this.group.rotation.y = Math.atan2(playerPosition.x - this.position.x, playerPosition.z - this.position.z); this.happyTime = 3; this.giftFlower.visible = true;
    return ['Thank you!', "It’s beautiful!", 'What a lovely flower.', 'You found this for me?'][Math.floor(Math.random() * 4)];
  }
  update(dt, time) {
    this.happyTime = Math.max(0, this.happyTime - dt); this.helloCooldown = Math.max(0, this.helloCooldown - dt);
    this.arms[0].rotation.x = this.happyTime > 0 ? -0.9 : Math.sin(time * 1.5) * 0.04;
    this.arms[1].rotation.z = this.happyTime > 0 ? -0.7 + Math.sin(time * 9) * 0.22 : 0.12;
    this.group.position.y = heightAt(this.position.x, this.position.z) + Math.sin(time * 2) * 0.018;
  }
}
