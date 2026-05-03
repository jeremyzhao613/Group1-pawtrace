# PawTrace Glass Dashboard

PawTrace's standalone digital twin dashboard for the 3001 showcase surface.

- React + Vite
- Tailwind CSS
- Three.js + React Three Fiber + Drei
- GSAP
- ECharts

## Run

1. `npm install`
2. `npm run dev`

The dev server listens on all interfaces at port `3001`.

- Local: `http://localhost:3001/`
- Same Wi-Fi / hotspot: `http://<computer-lan-ip>:3001/`

Start the backend on all interfaces so the M5Stick and the glass dashboard use the same LAN data path:

```bash
HOST=0.0.0.0 PORT=3000 npm run dev --prefix ../backend
npm run dev
```

Find the computer LAN IP on macOS:

```bash
ipconfig getifaddr en0
```

By default the 3001 dev and preview servers proxy `/api` and `/assets` to `http://localhost:3000`. If the backend is on another host, start with:

```bash
VITE_API_BASE_URL=http://<backend-lan-ip>:3000 npm run dev
```

## Structure

- `src/components`: header, focus rail, minimap, timeline
- `src/scene`: 3D scene, stadium model, POI nodes, camera rig
- `src/panels`: right-side data panels and charts
- `src/data`: mock digital twin data and snapshot generation
- `src/hooks`: dashboard state and live refresh hooks
- `src/utils`: formatting and chart option helpers
