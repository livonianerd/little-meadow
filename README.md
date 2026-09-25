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

Automated test files are not yet included. The existing test scripts are
placeholders and do not currently provide a passing test suite.
