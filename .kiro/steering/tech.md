---
inclusion: always
---

# Tech Stack

## Core
- Vanilla HTML, CSS, JavaScript — no build system, no bundler, no framework
- Single HTML entry point: `data-marketplace/index.html`
- No package.json, no npm, no dependencies
- Font: Lato (Google Fonts CDN)
- Design system: SGDS / MAS Singapore colour palette

## Architecture
- All JS is global-scope functions and variables (no modules)
- State is a single `state` object at the top of `app.js`
- DOM manipulation via `innerHTML` string templates and `document.getElementById`
- Canvas API used for dataset analytics charts (OTC, SGX, ACRA, MAS FX, Supervision, Adoption)
- Chart helper functions (`_otcResize`, `_bar`, `_line`, `_donut`, `_scatter`, `_adoptChart`) in `dataset-charts.js`

## Scripts Load Order (important)
1. `data/datasets.js` — defines `DATASETS`, `APPROVERS`, `DATASET_SCHEMAS`, `DATASET_META`, `DATASET_CATALOG`, `buildRangerPolicy`, `calcExpiry`
2. `dataset-charts.js` — all Canvas chart drawing functions (OTC FSR, SGX, ACRA, MAS FX, Supervision, Adoption)
3. `app.js` — application logic: login, navigation, rendering, state management

## External Services (CDN only, no API keys)
- Google Fonts (Lato)
- RandomUser.me (login avatar photos)
- UI Avatars (fallback avatars)

## Running the App
Open `data-marketplace/index.html` directly in a browser. No server required (no fetch/XHR calls).

## No Test Suite
There are no tests, no linting config, and no CI setup.

## Common Commands
- None — open `index.html` in browser to run
