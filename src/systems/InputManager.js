// All devices feed the same camera, movement, and interaction state.
export class InputManager {
  constructor(canvas, joystick, action) {
    this.enabled = false;
    this.keys = new Set(); this.pointers = new Map();
    this.moveX = 0; this.moveY = 0; this.jogPressed = false;
    this.cameraDeltaX = 0; this.cameraDeltaY = 0; this.zoomDelta = 0;
    this.interactPressed = false; this.stickX = 0; this.stickY = 0;
    this.joystick = joystick; this.knob = joystick.firstElementChild;
    const reveal = () => document.documentElement.classList.add('touch-controls');
    if (navigator.maxTouchPoints > 0 || matchMedia('(any-pointer: coarse)').matches) reveal();
    window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') reveal(); }, { passive: true });
    const movement = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'];
    window.addEventListener('keydown', e => {
      if (!this.enabled || e.target.closest?.('input, textarea, select')) return;
      if (movement.includes(e.code)) { e.preventDefault(); this.keys.add(e.code); }
      if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); this.interactPressed = true; }
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
    joystick.addEventListener('pointerdown', e => {
      if (!this.enabled || this.stickId != null || e.button !== 0) return;
      e.preventDefault(); this.stickId = e.pointerId;
      joystick.setPointerCapture(e.pointerId); joystick.classList.add('active'); this.updateStick(e);
    });
    joystick.addEventListener('pointermove', e => { if (e.pointerId === this.stickId) this.updateStick(e); });
    const endStick = e => { if (e.pointerId === this.stickId) this.resetStick(); };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) joystick.addEventListener(type, endStick);
    action.addEventListener('click', () => { if (this.enabled) this.interactPressed = true; });
    for (const surface of [canvas, joystick, action]) surface.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('pointerdown', e => {
      if (!this.enabled || e.button !== 0) return;
      e.preventDefault(); canvas.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener('pointermove', e => {
      const point = this.pointers.get(e.pointerId);
      if (!this.enabled || !point) return;
      // Only camera pointers participate in pinch; the movement thumb is independent.
      if (this.pointers.size === 2) {
        const other = [...this.pointers.values()].find(p => p !== point);
        const before = Math.hypot(point.x - other.x, point.y - other.y);
        const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        this.zoomDelta += (before - after) * 0.035;
      } else if (this.pointers.size === 1) {
        this.cameraDeltaX += e.clientX - point.x;
        this.cameraDeltaY += e.clientY - point.y;
      }
      point.x = e.clientX; point.y = e.clientY;
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, e => this.pointers.delete(e.pointerId));
    canvas.addEventListener('wheel', e => {
      if (this.enabled) { e.preventDefault(); this.zoomDelta += e.deltaY * 0.012; }
    }, { passive: false });
  }
  updateStick(e) {
    const rect = this.joystick.getBoundingClientRect();
    const radius = rect.width * 0.32;
    let x = (e.clientX - rect.left - rect.width / 2) / radius;
    let y = (e.clientY - rect.top - rect.height / 2) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    const magnitude = Math.min(1, length);
    const response = magnitude <= 0.1 ? 0 : (magnitude - 0.1) / 0.9;
    this.stickX = magnitude ? x / magnitude * response : 0;
    this.stickY = magnitude ? y / magnitude * response : 0;
    this.knob.style.transform = `translate(${x * radius}px, ${y * radius}px)`;
  }
  resetStick() {
    this.stickId = null; this.stickX = 0; this.stickY = 0;
    this.knob.style.transform = ''; this.joystick.classList.remove('active');
  }
  sample() {
    const k = this.keys;
    const x = Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft'));
    const y = Number(k.has('KeyS') || k.has('ArrowDown')) - Number(k.has('KeyW') || k.has('ArrowUp'));
    const length = Math.hypot(x, y) || 1;
    this.moveX = this.enabled ? (x || y ? x / length : this.stickX) : 0;
    this.moveY = this.enabled ? (x || y ? y / length : this.stickY) : 0;
    this.jogPressed = k.has('ShiftLeft') || k.has('ShiftRight');
  }
  clear() {
    this.keys.clear(); this.pointers.clear(); this.resetStick();
    this.moveX = this.moveY = this.cameraDeltaX = this.cameraDeltaY = this.zoomDelta = 0;
    this.interactPressed = false; this.jogPressed = false;
  }
}
