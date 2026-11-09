# Hardware for AI — Interactive Platform

Interactive, in-browser simulations for the IEEE GUC Student Branch **Hardware for AI** committee. Each session gets its own module: change the numbers, watch every multiply and add, and follow how AI computation maps onto digital hardware.

## Structure

```
index.html                 Hub: lists sessions (released ones only)
assets/css/theme.css       Shared IEEE GUC theme
assets/js/sessions.js      Session registry: flip `released` to publish a session
assets/img/                Logo and shared images
sessions/session-NN/       One self-contained module per session
.nojekyll                  Serve files as-is on GitHub Pages
```

## Adding or releasing a session

1. Build the module in `sessions/session-NN/index.html` (plus any `.js` it needs).
2. In `assets/js/sessions.js`, set that session's `released: true` and add its title, description, and `href`.

Unreleased sessions appear on the hub as numbered placeholders only, so upcoming topics are never spoiled.

## Running locally

Plain static files with no build step. Either open `index.html` directly, or serve the folder:

```
python -m http.server 8000
```

## Hosting

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.
