---
inclusion: always
---

# Project Structure

```
data-marketplace/
├── index.html            # Single HTML file — login page, all views, modals, drawers
├── styles.css            # All styles — SGDS palette, no external CSS libraries
├── app.js                # All application logic — login, state, rendering, event handlers
├── dataset-charts.js     # Canvas chart drawing functions (OTC, SGX, ACRA, MAS FX, Supervision, Adoption)
└── data/
    └── datasets.js       # Static data: DATASETS, DATASET_SCHEMAS, DATASET_META, DATASET_CATALOG, Ranger policy builder
```

## Conventions

- Views are `<div class="view" id="view-{name}">` elements toggled via `switchView(name)`
- Each view has a dedicated `render{ViewName}()` function in `app.js`
- Two-level navigation pattern (category tiles → detail list) used in: Catalog, Actions, Central Bank Feeds
- CSS variables are defined on `:root` in `styles.css` — always use them for colors/radii
- Inline styles in JS templates are acceptable for one-off layout tweaks
- New datasets go in `DATASETS` array in `datasets.js`; schemas in `DATASET_SCHEMAS`; metadata in `DATASET_META`; business catalog in `DATASET_CATALOG`
- Ranger policy shape is defined by `buildRangerPolicy()` in `datasets.js` — extend there, not in `app.js`
- All IDs referenced by JS use kebab-case (e.g. `view-catalog`, `stat-pending`)
- Chart functions go in `dataset-charts.js`, not `app.js`
- Dataset analytics sections use the `.fsr-section` dark-themed container with `.fsr-charts-grid` for 2×2 chart layout
- Login uses split-screen layout: left (branding/tour) + right (form/avatars)
- Role-based tab visibility managed in `toggleApproverMode()` and `doLogin()`
- Tab reordering for DivHead done via DOM `appendChild` in those same functions
- Action alerts defined in `ACTION_ALERTS` array with `category` field for grouping
- Central bank feeds defined in `CB_FEEDS` array with `region` field for geographic grouping
