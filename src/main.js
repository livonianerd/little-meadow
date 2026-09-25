import { Game } from './Game.js';
import './style.css';
const app = document.querySelector('#app');
try {
  const game = new Game(app);
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('test')) window.__meadow = game;
} catch (error) {
  console.error('Little Meadow could not start:', error);
  app.innerHTML = '<main class="error"><h1>A little pause</h1><p>The meadow needs WebGL. Please enable graphics acceleration or try another desktop browser.</p><button onclick="location.reload()">Try again</button></main>';
}
