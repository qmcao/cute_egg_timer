# Cute Egg Timer

Animated, minimal egg timer PWA that nails soft, medium, or hard-boiled eggs with cheerful UI, confetti, chimes, and vibration support.

## Features
- Playful glassmorphism card with animated gradient blobs, floating emoji, and SVG progress ring.
- Presets (soft/medium/hard) plus custom minutes + seconds inputs, local tasting notes, and celebratory confetti.
- Accurate timer driven by `requestAnimationFrame`, optional sound + vibration alerts, and cute copy.
- Installable PWA: manifest, custom icons, and offline-friendly service worker caching core assets.

## Getting Started
```bash
# install any static server (examples)
npm install -g serve
# or use the built-in python server

# run from project root
serve . -l 4173
# or
python -m http.server 4173
```
Visit [http://localhost:4173](http://localhost:4173) in your browser.

## Debug / Fast Testing
- Append `?debug=10` (or any positive number of seconds) to the URL to scale all timers so the medium preset lasts that many seconds.
- Example: `http://localhost:4173?debug=10` makes presets/custom inputs run in ~10 seconds; a banner appears to remind you you’re in debug mode.
- Remove the query parameter to return to real-world minutes.

## Deploy & Install on Phone
1. Upload the folder to any HTTPS static host (Netlify, Vercel, GitHub Pages + Cloudflare, etc.).
2. After deployment, open the URL on your phone.
3. Android Chrome: Chrome menu → "Install App" or "Add to Home screen".
4. iOS Safari: Share sheet → "Add to Home Screen". Launches fullscreen with custom icon.

## Customizing
- Update preset labels or the custom input layout in `index.html`.
- Tweak colors, animations, or layout in `styles.css`.
- Adjust timer behavior, confetti count, or alerts inside `app.js`.
- Replace icons in `icons/` (ensure 192×192 and 512×512 PNGs) and update `manifest.json` if needed.

## Notes
- Service worker currently caches core assets; bump `CACHE_NAME` in `service-worker.js` after large updates.
- Audio and vibration prompts require user interaction and device support.
- Respect accessibility preferences via the `prefers-reduced-motion` media query already included.
