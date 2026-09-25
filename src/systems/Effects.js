import * as THREE from 'three';
export class Effects {
  constructor(scene) {
    this.dummy = new THREE.Object3D(); this.particles = Array.from({ length: 36 }, () => ({ life: 0, position: new THREE.Vector3(), velocity: new THREE.Vector3() }));
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshBasicMaterial({ color: '#fff0ba' }), this.particles.length); this.mesh.frustumCulled = false; scene.add(this.mesh); this.update(0);
  }
  burst(position) {
    let count = 0;
    for (const p of this.particles) if (p.life <= 0) {
      p.life = 1.1; p.position.copy(position); p.position.y += 0.8;
      p.velocity.set((Math.random() - 0.5) * 1.7, 1 + Math.random(), (Math.random() - 0.5) * 1.7);
      if (++count === 9) break;
    }
  }
  update(dt) {
    this.particles.forEach((p, i) => {
      p.life -= dt;
      if (p.life > 0) { p.position.addScaledVector(p.velocity, dt); p.velocity.y -= dt * 0.6; }
      this.dummy.position.copy(p.position); this.dummy.scale.setScalar(Math.max(0, p.life)); this.dummy.updateMatrix(); this.mesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
