import * as THREE from 'three';
import { CONFIG } from '../config.js';

// The same continuous surface drives rendering, feet, trees, and the camera.
export function heightAt(x, z) {
  const flatten = Math.min(1, Math.hypot(x, z) / 65);
  return (Math.sin(x * 0.024) * 4 + Math.cos(z * 0.021) * 3 + Math.sin((x + z) * 0.038) * 1.8) * flatten;
}
export class Terrain {
  constructor(scene) {
    const geometry = new THREE.PlaneGeometry(CONFIG.worldSize * 2, CONFIG.worldSize * 2, 180, 180);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), z = positions.getZ(i);
      const y = heightAt(x, z);
      positions.setY(i, y);
      color.set('#91b76c').lerp(new THREE.Color('#acc780'), (Math.sin(x * 0.14 + z * 0.08) + 1) * 0.15);
      color.multiplyScalar(0.97 + Math.sin(x * 0.43 - z * 0.2) * 0.025);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}
