export const CONFIG = {
  worldSize: 600,
  walkSpeed: 5,
  jogSpeed: 8.5,
  interactionRadius: 3.1,
  camera: { distance: 13, minDistance: 7, maxDistance: 24, pitch: 0.38 },
  flowerCount: 340,
  acornCount: 145,
  squirrelCount: 12,
  flowerRespawn: 24,
  acornRespawn: 30,
  rewards: { flower: 10, acorn: 5 },
};
export function random(min, max) { return min + Math.random() * (max - min); }
export function seededRandom(seed = 71) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
