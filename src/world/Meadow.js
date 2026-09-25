import * as THREE from 'three';
import { Terrain, heightAt } from './Terrain.js';
import { Trees } from './Trees.js';
import { seededRandom } from '../config.js';

export class Meadow {
  constructor(scene) {
    new Terrain(scene);
    this.trees = new Trees(scene);
    this.addGroundCover(scene);
    this.addHome(scene);
    this.addSky(scene);
  }
  addGroundCover(scene) {
    const rng = seededRandom(59), dummy = new THREE.Object3D();
    const blade = new THREE.BufferGeometry();
    blade.setAttribute('position', new THREE.Float32BufferAttribute([-0.12, 0, 0, 0.08, 0.65, 0.02, 0.12, 0, 0, 0, 0, -0.12, 0.03, 0.5, 0.1, 0, 0, 0.12], 3));
    blade.computeVertexNormals();
    const grass = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ color: '#769956', side: THREE.DoubleSide, roughness: 1 }), 16000);
    for (let i = 0; i < grass.count; i++) {
      const radius = Math.sqrt(rng()) * (i < 9500 ? 100 : 325), angle = rng() * Math.PI * 2;
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
      dummy.position.set(x, heightAt(x, z), z); dummy.rotation.set(0, rng() * 6.28, 0); dummy.scale.setScalar(0.6 + rng() * 0.8); dummy.updateMatrix();
      grass.setMatrixAt(i, dummy.matrix);
    }
    scene.add(grass);
    for (const [kind, count, color] of [['bush', 130, '#749959'], ['rock', 65, '#b4b5a0']]) {
      const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1 }), count);
      for (let i = 0; i < count; i++) {
        const angle = rng() * 6.28, radius = 18 + rng() * 285, x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
        dummy.position.set(x, heightAt(x, z) + 0.35, z);
        dummy.scale.set(0.7 + rng() * 1.5, kind === 'bush' ? 0.7 + rng() : 0.4 + rng() * 0.5, 0.7 + rng()); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.castShadow = true; scene.add(mesh);
    }
  }
  addHome(scene) {
    const base = new THREE.Group(); base.position.set(-6.5, heightAt(-6.5, -6), -6);
    // Separate squares follow the terrain so the blanket never floats on a slope.
    for (let x = 0; x < 6; x++) for (let z = 0; z < 5; z++) {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.025, 0.65), new THREE.MeshStandardMaterial({ color: (x + z) % 2 ? '#eee1be' : '#c88871', roughness: 1 }));
      tile.position.set(x * 0.65 - 1.6, 0.04, z * 0.65); base.add(tile);
    }
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.33, 0.5, 9), new THREE.MeshStandardMaterial({ color: '#ba8c58' }));
    basket.position.set(-1, 0.3, 0.65); base.add(basket);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 5, 12, Math.PI), new THREE.MeshStandardMaterial({ color: '#946e47' }));
    handle.position.set(-1, 0.57, 0.65); base.add(handle);
    scene.add(base);
    const sign = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: '#b29467' });
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.5, 0.12), wood); post.position.y = 0.75; sign.add(post);
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 160;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ede4cb'; ctx.fillRect(0, 0, 512, 160); ctx.fillStyle = '#5a684c'; ctx.font = '36px Georgia'; ctx.textAlign = 'center'; ctx.fillText('a little place to be', 256, 95);
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.84, 0.13), [wood, wood, wood, wood, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }), wood]);
    board.position.y = 1.45; sign.add(board); sign.position.set(-3.1, heightAt(-3.1, -3), -3); sign.rotation.y = 0.2; scene.add(sign);
  }
  addSky(scene) {
    const material = new THREE.MeshStandardMaterial({ color: '#f6f4dd', flatShading: true, roughness: 1 });
    const rng = seededRandom(36);
    for (let i = 0; i < 20; i++) {
      const cloud = new THREE.Group();
      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
        puff.position.set(j * 7, Math.sin(j * 2) * 1.5, 0); puff.scale.set(8, 3.6 + rng() * 3, 5); cloud.add(puff);
      }
      cloud.position.set((rng() - 0.5) * 650, 58 + rng() * 35, -100 - rng() * 200); scene.add(cloud);
    }
    const hills = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ color: '#a4bb8a', flatShading: true }), 24);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2;
      dummy.position.set(Math.sin(a) * 470, -8, Math.cos(a) * 470); dummy.scale.set(100, 25 + rng() * 40, 100); dummy.updateMatrix(); hills.setMatrixAt(i, dummy.matrix);
    }
    scene.add(hills);
  }
}
