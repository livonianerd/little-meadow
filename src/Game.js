import * as THREE from 'three';
import { Meadow } from './world/Meadow.js';
import { Player } from './player/Player.js';
import { PlayerController } from './player/PlayerController.js';
import { Flowers } from './world/Flowers.js';
import { Nuts } from './world/Nuts.js';
import { Mom } from './npc/Mom.js';
import { Squirrel } from './npc/Squirrel.js';
import { Inventory } from './systems/Inventory.js';
import { ScoreSystem } from './systems/ScoreSystem.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { Effects } from './systems/Effects.js';
import { UI } from './ui/UI.js';
import { InputManager } from './systems/InputManager.js';
import { CONFIG } from './config.js';
import { heightAt } from './world/Terrain.js';

export class Game {
  constructor(container) {
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#d7e6cd'); this.scene.fog = new THREE.Fog('#d7e6cd', 70, 330);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.setClearColor('#d7e6cd'); container.prepend(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-label', 'Little Meadow, a peaceful 3D meadow');
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 900); this.camera.position.set(20, 16, 27);
    this.scene.add(new THREE.HemisphereLight('#fff5da', '#81946b', 2.2));
    this.sun = new THREE.DirectionalLight('#fff0cf', 2.5); this.sun.position.set(-25, 45, 22); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048); Object.assign(this.sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 140 }); this.sun.shadow.bias = -0.0005; this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun, this.sun.target);
    this.meadow = new Meadow(this.scene); this.player = new Player(this.scene);
    this.flowers = new Flowers(this.scene); this.nuts = new Nuts(this.scene, this.meadow.trees);
    this.mom = new Mom(this.scene);
    this.squirrels = Array.from({ length: CONFIG.squirrelCount }, (_, i) => {
      const tree = this.meadow.trees.positions[i];
      return new Squirrel(this.scene, tree.x + 2.5, tree.z + 3.5);
    });
    let storage;
    try { storage = window.localStorage; } catch { storage = { getItem() { throw new Error('Storage disabled'); }, setItem() { throw new Error('Storage disabled'); } }; }
    this.saveSystem = new SaveSystem(storage); const saved = this.saveSystem.load();
    this.inventory = new Inventory(saved); this.score = new ScoreSystem(saved); this.audio = new AudioSystem(saved.muted);
    this.mom.updateBouquet(this.score.flowersGiven);
    this.interactions = new InteractionSystem(this.inventory, [...this.flowers.items, ...this.nuts.items, this.mom, ...this.squirrels]);
    this.effects = new Effects(this.scene);
    this.ui = new UI(container, { start: () => this.start(), pause: () => this.pause(), resume: () => this.resume(), sound: () => this.toggleSound(), reset: () => this.reset() });
    this.input = new InputManager(this.renderer.domElement, this.ui.$('joystick'), this.ui.$('touch-action'));
    this.controller = new PlayerController(this.player, this.camera, this.input);
    this.ui.updateInventory(this.inventory, this.score); this.ui.muted(this.audio.muted);
    this.ui.$('save-note').hidden = this.saveSystem.available;
    window.addEventListener('keydown', e => {
      if (!this.started || e.repeat) return;
      if (e.code === 'Escape') { e.preventDefault(); this.paused ? this.resume() : this.pause(); }
    });
    window.addEventListener('blur', () => { if (this.started && !this.paused) this.pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.started) this.pause(); });
    this.started = false; this.paused = false; this.time = 0; this.lastTime = performance.now();
    window.addEventListener('resize', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.resize());
    document.addEventListener('fullscreenchange', () => this.resize());
    new ResizeObserver(() => this.resize()).observe(container); this.resize();
    this.renderer.setAnimationLoop(now => this.frame(now));
  }
  resize() { const { width, height } = this.renderer.domElement.parentElement.getBoundingClientRect(); this.camera.aspect = width / Math.max(1, height); this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height); }
  start() {
    this.started = true; this.controller.enabled = true; this.ui.start(); this.audio.start();
    this.ui.message('A whole afternoon, just for you.');
  }
  pause() {
    if (!this.started) return;
    this.paused = true; this.controller.enabled = false; this.controller.clear(); this.audio.pause(); this.ui.prompt(''); this.ui.menu(true);
  }
  resume() { this.paused = false; this.controller.enabled = true; this.ui.menu(false); this.audio.start(); }
  toggleSound() { this.audio.setMuted(!this.audio.muted); this.ui.muted(this.audio.muted); this.persist(); }
  persist() {
    this.saveSystem.save(this.inventory, this.score, this.audio.muted);
    this.ui.$('save-note').hidden = this.saveSystem.available;
    this.ui.updateInventory(this.inventory, this.score);
  }
  reset() {
    this.inventory.reset(); this.score.reset(); this.persist(); this.controller.clear();
    this.player.group.position.set(0, heightAt(0, 6), 6); this.player.group.rotation.y = Math.PI; this.player.actionTime = 0;
    this.controller.yaw = 0; this.controller.pitch = CONFIG.camera.pitch; this.controller.distance = CONFIG.camera.distance;
    this.camera.position.set(0, 7, 19);
    this.mom.happyTime = 0; this.mom.updateBouquet(this.score.flowersGiven);
    for (const collection of [this.flowers, this.nuts]) for (const item of collection.items) { item.active = true; item.remaining = 0; collection.draw(item); }
    for (const squirrel of this.squirrels) { squirrel.position.copy(squirrel.home); squirrel.state = 'idle'; squirrel.remaining = 4; }
    this.interactions.current = null; this.ui.rewardTime = 0; this.resume(); this.ui.message('A fresh meadow. The same warm welcome.');
  }
  interact() {
    if (this.player.actionTime > 0.2) return;
    // Re-evaluate when an interaction is requested, so a previous frame's prompt cannot give a stale item.
    this.interactions.update(this.player.group.position);
    const object = this.interactions.current;
    if (!object) return;
    this.player.group.rotation.y = Math.atan2(object.position.x - this.player.group.position.x, object.position.z - this.player.group.position.z);
    if (object.kind === 'collectible') {
      const collection = object.type === 'flowers' ? this.flowers : this.nuts;
      collection.collect(object); this.inventory.add(object.type); this.player.animateAction('pickup'); this.audio.play(object.type === 'flowers' ? 'flower' : 'acorn');
    } else if (object.kind === 'mom' && this.inventory.take('flowers')) {
      this.player.animateAction('give'); this.ui.message(`Mom: “${this.mom.receive(this.player.group.position)}”`);
      this.ui.reward(this.score.reward('flower')); this.mom.updateBouquet(this.score.flowersGiven); this.audio.play('kindness');
    } else if (object.kind === 'squirrel' && this.inventory.take('acorns')) {
      this.player.animateAction('give'); object.receive(this.player.group.position);
      this.ui.reward(this.score.reward('acorn')); this.audio.play('kindness'); this.audio.play('squirrel'); this.ui.message('A little acorn. A very happy squirrel.');
    } else return;
    this.effects.burst(object.position); this.persist();
    this.ui.prompt(this.interactions.update(this.player.group.position));
  }
  frame(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); this.lastTime = now;
    if (!this.paused) {
      this.time += dt;
      if (this.started) {
        this.controller.update(dt);
        if (this.input.interactPressed) { this.input.interactPressed = false; this.interact(); }
      }
      else this.camera.lookAt(-2, 1, -3);
      this.player.update(dt, this.time);
      this.mom.update(dt, this.time); for (const squirrel of this.squirrels) squirrel.update(dt, this.time);
      this.effects.update(dt);
      if (this.started) {
        const p = this.player.group.position;
        this.flowers.update(dt, p); this.nuts.update(dt, p);
        this.ui.prompt(this.interactions.update(p)); this.ui.update(dt, p); this.audio.update(dt, this.player.speed);
        if (p.distanceTo(this.mom.position) < 4 && this.inventory.flowers === 0 && this.mom.helloCooldown === 0 && this.ui.messageTime <= 0) { this.ui.message('Mom: “Hello, sweetheart.”'); this.mom.helloCooldown = 30; }
        this.sun.position.set(p.x - 25, p.y + 45, p.z + 22); this.sun.target.position.copy(p);
        const homeAngle = Math.atan2(-6 - p.x, -6 - p.z) - this.controller.yaw;
        this.ui.$('home-direction').firstElementChild.style.transform = `rotate(${-homeAngle * 180 / Math.PI + 180}deg)`;
        this.ui.$('home-direction').firstElementChild.textContent = '↑';
        this.ui.$('home-direction').firstElementChild.style.display = 'inline-block';
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
