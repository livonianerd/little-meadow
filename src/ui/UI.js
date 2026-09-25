const icons = {
  flower: '<svg viewBox="0 0 32 32" fill="none"><g fill="currentColor"><ellipse cx="16" cy="9" rx="4" ry="6"/><ellipse cx="16" cy="9" rx="4" ry="6" transform="rotate(72 16 16)"/><ellipse cx="16" cy="9" rx="4" ry="6" transform="rotate(144 16 16)"/><ellipse cx="16" cy="9" rx="4" ry="6" transform="rotate(216 16 16)"/><ellipse cx="16" cy="9" rx="4" ry="6" transform="rotate(288 16 16)"/></g><circle cx="16" cy="16" r="4" fill="#f4e7b6"/></svg>',
  acorn: '<svg viewBox="0 0 32 32" fill="none"><path d="M8 14c0 9 5 13 8 14 4-2 8-6 8-14" fill="currentColor" opacity=".7"/><path d="M6 15c0-6 4-9 10-9s10 3 10 9H6Z" fill="currentColor"/><path d="M16 7c0-4 2-5 4-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  heart: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 27S4 19 4 11a6.5 6.5 0 0 1 12-3 6.5 6.5 0 0 1 12 3c0 8-12 16-12 16Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 8h14M5 16h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none"><path d="m11 5-5 4H3v6h3l5 4V5Zm4 3c3 2 3 6 0 8m3-11c5 4 5 10 0 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
export class UI {
  constructor(container, callbacks) {
    this.callbacks = callbacks; this.messageTime = 0; this.rewardTime = 0;
    const layer = document.createElement('div'); layer.id = 'ui';
    layer.innerHTML = `
      <div id="landing">
        <header class="landing-header"><a class="wordmark" href="./" aria-label="Little Meadow home">${icons.flower}<span>little meadow</span></a><span class="edition">A SMALL WORLD. A SOFTER PACE.</span><button class="icon-button sound-toggle" aria-label="Turn sound off" title="Sound on/off">${icons.sound}</button></header>
        <main class="welcome">
          <div class="eyebrow"><span></span> YOUR OWN LITTLE CORNER OF CALM</div>
          <h1>Little<br><em>Meadow</em><span class="title-flower">${icons.flower}</span></h1>
          <p class="tagline">Wander. Gather. Be kind.</p>
          <p class="intro">A sunny field, a handful of flowers,<br>and nowhere you need to be.</p>
          <button id="start" class="primary">Start Exploring <span aria-hidden="true">↗</span></button>
          <p class="no-pressure">There is no winning or losing.<br>Stay as long as you like.</p>
        </main>
        <div class="scene-caption"><span class="caption-line"></span><span>A little kindness grows here.</span></div>
        <footer class="landing-footer"><div><span class="tiny-flower">✳</span> MADE FOR THE JOY OF WANDERING</div><span>Take a breath. You’re in no hurry.</span><span class="version">VOL. 01 · THE MEADOW</span></footer>
      </div>
      <div id="hud" hidden>
        <div class="inventory glass" aria-label="Inventory"><div class="counter flower-counter" title="Flowers">${icons.flower}<span id="flowers">0</span><span class="counter-label">flowers</span></div><span class="separator"></span><div class="counter acorn-counter" title="Acorns">${icons.acorn}<span id="acorns">0</span><span class="counter-label">acorns</span></div></div>
        <div class="top-right"><div class="kindness glass">${icons.heart}<div><span id="kindness">0</span><small>KINDNESS</small></div></div><button id="menu-button" class="icon-button glass" aria-label="Open meadow menu" title="Menu (Esc)">${icons.menu}</button></div>
        <div class="location"><span class="location-dot"></span> The sunny meadow</div>
        <div id="message" role="status" hidden></div><div id="reward" aria-live="polite" hidden></div>
        <div id="prompt" class="glass" hidden><kbd>E</kbd><span></span></div>
        <div id="controls"><span><kbd>W A S D</kbd> wander</span><span><kbd>SHIFT</kbd> jog</span><span><span class="mouse-icon">↔</span> drag to look</span><span>scroll to get closer</span></div>
        <div id="home-direction" hidden><span>⌂</span> <span id="home-text">Picnic tree</span></div>
        <p id="save-note" hidden>Saving is unavailable in this browser. You can still explore.</p>
      </div>
      <div id="menu-overlay" class="overlay" hidden>
        <section class="menu-card" role="dialog" aria-modal="true" aria-labelledby="menu-title">
          <div class="menu-flower">${icons.flower}</div><div class="eyebrow">TAKE YOUR TIME</div><h2 id="menu-title">A little pause</h2><p>The meadow will be right here.</p>
          <div id="menu-main"><button id="resume" class="primary">Resume exploring <span>↗</span></button><button class="menu-row sound-toggle">Sound <span id="sound-state">On</span></button><button id="about-button" class="menu-row">About the meadow <span>↗</span></button><button id="restart-button" class="menu-row">Restart Meadow <span>↻</span></button><p class="saved">Your kindness is saved as you go.</p></div>
          <div id="about-panel" hidden><p>A small place to wander, gather, and be kind. Give flowers to Mom at the picnic tree, or share an acorn with a squirrel.</p><p>No winning. No losing. Just a little joy.</p><p class="about-controls">WASD / arrows · Walk<br>Shift · Jog &nbsp; E · Interact<br>Mouse drag · Look &nbsp; Scroll · Zoom<br>Esc · Pause</p><p id="memories"></p><button class="back-button secondary">Back to menu</button></div>
          <div id="reset-panel" hidden><h3>A fresh little beginning?</h3><p>This clears your kindness, gifts given, and held flowers and acorns, and returns you to the picnic tree.</p><p>You can keep exploring for as long as you like without restarting.</p><button id="confirm-reset" class="primary">Yes, restart the meadow</button><button class="back-button secondary">Keep my meadow</button></div>
        </section>
      </div>`;
    container.append(layer); this.layer = layer;
    this.$('start').onclick = () => callbacks.start();
    this.$('menu-button').onclick = () => callbacks.pause();
    this.$('resume').onclick = () => callbacks.resume();
    layer.querySelectorAll('.sound-toggle').forEach(b => b.onclick = () => callbacks.sound());
    this.$('about-button').onclick = () => { this.panel('about-panel'); layer.querySelector('#about-panel button').focus(); };
    this.$('restart-button').onclick = () => { this.panel('reset-panel'); layer.querySelector('#reset-panel .back-button').focus(); };
    this.$('confirm-reset').onclick = () => callbacks.reset();
    layer.querySelectorAll('.back-button').forEach(b => b.onclick = () => { this.panel('menu-main'); this.$('resume').focus(); });
    this.$('menu-overlay').addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const buttons = [...this.$('menu-overlay').querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const first = buttons[0], last = buttons.at(-1);
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });
  }
  $(id) { return this.layer.querySelector(`#${id}`); }
  start() { this.$('landing').hidden = true; this.$('hud').hidden = false; }
  menu(show) { this.$('menu-overlay').hidden = !show; this.$('hud').inert = show; if (show) { this.panel('menu-main'); this.$('resume').focus(); } else this.$('menu-button').focus(); }
  panel(id) { for (const p of ['menu-main', 'about-panel', 'reset-panel']) this.$(p).hidden = id !== p; }
  updateInventory(inventory, score) {
    this.$('flowers').textContent = inventory.flowers; this.$('acorns').textContent = inventory.acorns; this.$('kindness').textContent = score.kindness;
    this.$('memories').textContent = `${score.flowersGiven} flowers shared with Mom · ${score.squirrelsFed} squirrels treated`;
  }
  prompt(text) { this.$('prompt').hidden = !text; if (text) this.$('prompt').querySelector('span').textContent = text; }
  message(text) { this.$('message').textContent = text; this.$('message').hidden = false; this.messageTime = 4.5; }
  reward(points) { this.$('reward').textContent = `♡ +${points} kindness`; this.$('reward').hidden = false; this.rewardTime = 2.5; }
  muted(value) {
    this.$('sound-state').textContent = value ? 'Off' : 'On';
    this.layer.querySelectorAll('.sound-toggle').forEach(b => { b.setAttribute('aria-label', value ? 'Turn sound on' : 'Turn sound off'); b.setAttribute('aria-pressed', String(!value)); b.classList.toggle('muted', value); });
  }
  update(dt, position) {
    this.messageTime -= dt; this.rewardTime -= dt;
    if (this.messageTime <= 0) this.$('message').hidden = true;
    if (this.rewardTime <= 0) this.$('reward').hidden = true;
    const distance = Math.hypot(position.x + 6, position.z + 6);
    this.$('home-direction').hidden = distance < 28;
    if (distance >= 28) this.$('home-text').textContent = `Picnic tree · ${Math.round(distance)} m`;
  }
}
