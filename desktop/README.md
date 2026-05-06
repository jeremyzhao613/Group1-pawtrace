# Desktop

Electron wrapper for the packaged PawTrace desktop app.

## Important Paths

- `main.cjs`: Electron main process.
- `preload.cjs`: preload bridge for the renderer.

The packaged app loads the built frontend from `frontend/dist/`. Use the root
desktop packaging scripts so runtime config is written before packaging:

```bash
npm run package:desktop:dir
npm run package:dmg
```

