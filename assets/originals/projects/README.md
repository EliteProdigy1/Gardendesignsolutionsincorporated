# GDSI Case Study System — projects

Each project is a self-contained folder of media plus one config entry in
**`scripts/projects.js`**. The site renders a full case study per project and
**stays hidden until a project's `enabled` flag is `true`**. Every sub-section
is data-driven — it appears only when its media/fields exist.

## Per-project folder

```
assets/projects/<slug>/
  plans/        landscape plan image(s)         → Plan Viewer
  before/       "before" photography            → Before/During/After slider
  during/       construction photography        → slider + Construction Timeline
  after/        completed-day photography        → slider + Gallery
  twilight/     twilight photography            → Gallery
  drone/        aerial / drone photography      → Gallery
  details/      detail photography              → Gallery
  video/        walkthrough / cinematic video   → (reserved)
  pdf/          downloadable plan PDF           → "Download plan (PDF)"
```

Image spec: **3:2, 2400×1600 px or larger**, matched camera angle for
before/after pairs. Export `.webp` (quality ~80).

## To add a project (drop media + one flag)

1. `mkdir assets/projects/<slug>/{plans,before,during,after,twilight,drone,details,video,pdf}`
   and drop the verified media in.
2. In `scripts/projects.js`, copy a project block and fill it in:
   - **Info:** name, city, completionYear, featured, services, categories, story
   - **Landscape:** plantPalette, hardscapeMaterials, lightingSystem, irrigation, specialFeatures
   - **Media:** plan, pdf, video, before[], construction[], completedDay[], twilight[], drone[], details[]
   - **comparisons[]:** before/during/after sets for the slider
3. Set **`enabled: true`** and set `status: 'verified'` (drops the concept
   disclosure) once the photography is real.
4. Rebuild: `node scripts/build-gdsi.js`.

## Interactive sections (auto-rendered from data)

| Section | Shows when |
|---|---|
| Landscape Plan Viewer (zoomable) | `media.plan` set |
| Download PDF Plan | `media.pdf` set |
| Before / During / After slider | `comparisons[]` present |
| Construction Timeline | `media.construction[]` present |
| Gallery (completed · twilight · drone · detail) | any of those arrays present |
| Project Specifications | any Landscape Information field set |

## Truthfulness

Keep a project `enabled: false` until its media is verified. For conceptual /
AI imagery, set `status: 'concept'` so the disclosure is shown and no
historical claims are made. Never invent `completionYear`, `story`, plant lists
or specifications.

## Current state

- `southern-estate-pool-courtyard/` — conceptual before/during/after imagery
  installed (from the uploaded pack); **`enabled: false`** so nothing renders
  publicly. Other media folders are empty placeholders (`.gitkeep`) awaiting
  verified photography.

> The curated Built-Environments gallery photos live separately in
> `assets/gallery/` — they are not part of any single project.
