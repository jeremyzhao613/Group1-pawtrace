# Frontend

Main PawTrace web app. It is a Vite-served static app with Tailwind-generated
CSS.

## Important Paths

- `index.html`: Vite entrypoint.
- `public/app/app.js`: main browser application logic.
- `public/app/style.tailwind.css`: Tailwind input CSS.
- `public/app/app.css`: generated CSS output from Tailwind.
- `public/app/runtime-config.js`: runtime API config used by web and packaged builds.
- `public/map.js`: map integration code.
- `public/assets/`: frontend-served static assets.
- `dist/`: generated build output.
- `android/`, `ios/`: Capacitor platform projects generated/synced for packaging.

## Commands

```bash
npm run dev --prefix frontend
npm run build --prefix frontend
npm run cap:sync --prefix frontend
```

Use root scripts for packaged targets, because they also write runtime config:

```bash
npm run package:android
npm run package:ios
npm run package:desktop:dir
```

