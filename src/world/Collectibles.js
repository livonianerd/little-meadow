import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { heightAt } from './Terrain.js';
import { random } from '../config.js';

export function coloredGeometry(geometry, color, x = 0, y = 0, z = 0) {
  geometry.translate(x, y, z);
  const c = new THREE.Color(color), values = [];
  for (let i = 0; i < geometry.attributes.position.count; i++) values.push(c.r, c.g, c.b);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(values, 3));
  return geometry;
}
export { mergeGeometries };
export class Collectibles {
  constructor(scene, count, geometries, respawnSeconds, placement) {
    this.respawnSeconds = respawnSeconds; this.placement = placement; this.dummy = new THREE.Object3D();
    this.items = []; this.meshes = [];
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });
    for (let i = 0; i < geometries.length; i++) {
      const mesh = new THREE.InstancedMesh(geometries[i], material, Math.ceil(count / geometries.length));
      // Spawn positions change, so don't retain a stale bounding sphere.
      mesh.frustumCulled = false; scene.add(mesh); this.meshes.push(mesh);
    }
    for (let i = 0; i < count; i++) {
      const p = placement(i);
      const item = { kind: 'collectible', position: new THREE.Vector3(p.x, heightAt(p.x, p.z), p.z), active: true, remaining: 0, mesh: this.meshes[i % geometries.length], index: Math.floor(i / geometries.length), rotation: random(0, Math.PI * 2), scale: random(0.9, 1.25) };
      this.items.push(item); this.draw(item);
    }
    // Clear unused slots when the count isn't divisible by the variation count.
    for (let i = count; i < Math.ceil(count / geometries.length) * geometries.length; i++) {
      this.dummy.scale.setScalar(0); this.dummy.updateMatrix(); this.meshes[i % geometries.length].setMatrixAt(Math.floor(i / geometries.length), this.dummy.matrix);
    }
  }
  draw(item) {
    this.dummy.position.copy(item.position); this.dummy.rotation.set(0, item.rotation, 0); this.dummy.scale.setScalar(item.active ? item.scale : 0); this.dummy.updateMatrix();
    item.mesh.setMatrixAt(item.index, this.dummy.matrix); item.mesh.instanceMatrix.needsUpdate = true;
  }
  collect(item) { item.active = false; item.remaining = this.respawnSeconds + random(0, 10); this.draw(item); }
  update(dt, playerPosition) {
    for (const item of this.items) if (!item.active) {
      item.remaining -= dt;
      if (item.remaining <= 0) {
        const p = this.placement(-1, playerPosition);
        item.position.set(p.x, heightAt(p.x, p.z), p.z); item.active = true; this.draw(item);
      }
    }
  }
}
