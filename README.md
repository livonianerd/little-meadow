# Little Meadow

A peaceful browser game built with Three.js and Vite. Wander the meadow,
collect flowers and acorns, give flowers to Mom, and feed squirrels.
Progress is saved in your browser.

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Use WASD or arrow keys to walk,
Shift to jog, mouse drag to look, scroll to zoom, E to interact, and Esc to pause.

## Build and deploy

```sh
npm run build
npm run preview
```

Pushes to `main` build and deploy `dist/` to GitHub Pages through GitHub Actions.
The repository's Pages source must be set to GitHub Actions.

## Testing status

Run `npx playwright install chromium` once, then `npm test` (or `npm run test:e2e`).
The browser suite checks desktop controls, touch movement and cancellation,
simultaneous camera input, pinch zoom, collecting and gifting, inventory/kindness,
menus, saved progress, and phone/tablet viewport changes. Tests use Chromium touch
emulation; real iOS Safari and Android device verification remains recommended.

## Mobile Controls

Desktop:
- WASD / arrows — move
- Shift — jog
- Mouse drag — look
- Mouse wheel — zoom
- E — interact
- Esc — pause

Mobile (phones and tablets, portrait or landscape):
- Left joystick — move; drag farther to walk faster, release to stop
- Drag the meadow — look, including while moving with the other thumb
- Pinch the meadow with two fingers — zoom
- Action button — pick flowers/acorns or give them to Mom/squirrels
- Top-right menu — pause, sound, restart, and optional fullscreen

Touch controls appear automatically on touch-capable devices. Keyboard and mouse
remain available. Landscape offers a wider view; portrait works too. Fullscreen
is optional and shown only when supported by the browser. Progress saves in the
same browser as before.

## Mom's bouquet

Flowers shared with Mom stay in her hand as a colorful bouquet. It grows at
1, 3, 6, 11, and 21 gifts, using the existing saved `flowersGiven` total (including
older saves). Further gifts still earn kindness. Restart Meadow clears it along
with the other progress. The display uses one merged mesh and rebuilds only when
crossing a growth stage.

If port 5173 is occupied, run the browser suite with
`PLAYWRIGHT_PORT=5174 npm test` to use another development server port.
