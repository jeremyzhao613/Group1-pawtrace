# Venue Pulse Twin

High-end stadium digital twin demo built with:

- React + Vite
- Tailwind CSS
- Three.js + React Three Fiber + Drei
- GSAP
- ECharts

## Run

1. `npm install`
2. `npm run dev`

## Structure

- `src/components`: header, focus rail, minimap, timeline
- `src/scene`: 3D scene, stadium model, POI nodes, camera rig
- `src/panels`: right-side data panels and charts
- `src/data`: mock digital twin data and snapshot generation
- `src/hooks`: dashboard state and live refresh hooks
- `src/utils`: formatting and chart option helpers
