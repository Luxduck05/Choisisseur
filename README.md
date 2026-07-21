# Choisisseur 🎡👆

A playful, client-only decision-making PWA with two modes:

- **Wheel** — a weighted spin-the-wheel picker with saved wheels, templates,
  per-segment colors/weights, flick-to-spin physics, and sound effects.
- **Fingers** — a multi-touch picker: everyone places a finger, a 3-second
  countdown runs, then the app picks a winner, multiple winners, teams, or a
  turn order (with vibration feedback).

Everything runs in the browser; saved wheels live in `localStorage`. The app is
an installable PWA (manifest + service worker) and builds to a plain static
site.

## Develop

```bash
npm install
npm run dev
```

## Build & preview

```bash
npm run build    # static site in dist/
npm run preview  # serve the production build locally
```

Deploy by hosting the `dist/` folder on any static host.

## Structure

- `src/components/wheel/` — wheel mode (SVG wheel + physics, option editor, saved-wheel manager, winner modal)
- `src/components/finger/` — finger mode (multi-touch area, countdown, four picking modes)
- `src/utils/` — randomness (single fairness source), wheel geometry, synthesized sounds, templates, palette
- `src/hooks/useLocalStorage.js` — persistence
- `vite.config.js` — PWA manifest + service worker via `vite-plugin-pwa`
