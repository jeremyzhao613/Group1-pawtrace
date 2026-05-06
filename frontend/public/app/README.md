# PAWTRACE App Folder Order

This folder contains the browser app runtime files that are served from `/app/*`.

Load and edit order:

1. `runtime-config.js` - runtime API/base URL overrides loaded before app code.
2. `style.tailwind.css` - source CSS. Edit this file for app styling.
3. `app.css` - generated CSS. Do not edit by hand; run `npm run build:app-css`.
4. `app.js` - main browser app behavior.

Static media should live under `frontend/public/assets/`, not this folder.
