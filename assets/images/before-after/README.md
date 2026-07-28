# Before / After image pairs

Drop-in assets for the data-driven Before & After comparison slider.

## Image requirements

- **Aspect ratio: 3:2** (the slider containers are locked to 3:2 to prevent layout shift).
- **Recommended source size: 2400 × 1600 px or larger.**
- **Landscape orientation.**
- The **before** and **after** frames of a pair must share the **same — or a
  very closely matched — camera position, angle, focal length and framing**, or
  the wipe will not line up.
- Export as `.webp` for the site (quality ~80). Keep a high-res `.jpg`/original
  as your source archive.

## File naming

```
project-01-before.webp   project-01-after.webp   project-01-during.webp (optional)
project-02-before.webp   project-02-after.webp   project-02-during.webp (optional)
project-03-before.webp   project-03-after.webp   project-03-during.webp (optional)
```

Supports **3–5 project pairs** — add `project-04-*`, `project-05-*` as needed.

## How to add / enable a project (data-driven — no component edits)

Everything is driven by the **project schema** in **`scripts/projects.js`**.
Each project supports:

| Field | Meaning |
|-------|---------|
| `enabled` | **The one flag** that publishes the project. |
| `featured` | Featured toggle (pinned first). |
| `status` | `concept` (shows disclosure, no historical claims) or `verified`. |
| `name` | Project Name. |
| `city` | City. |
| `completionYear` | Completion Year (`null` until verified — never invented). |
| `services` | Services Performed (rendered as chips). |
| `categories` | Portfolio Categories (`pools · courtyards · gardens · lighting · entrances`). |
| `story` | Project Story (`null` until written). |
| `comparisons` | List of Before / During / After image sets `{ label, before, during, after }`. |

To publish a project:

1. Drop the matched `-before.webp` / `-after.webp` (and optional `-during.webp`)
   into this folder.
2. In `scripts/projects.js`, fill the fields and set **`enabled: true`**.
3. Rebuild (`node scripts/build-gdsi.js`). The whole **section stays hidden
   while every project is `enabled: false`**, and appears automatically once
   one is enabled. Supports 3–5+ projects, each with multiple comparisons.

> The live slider compares **before ↔ after**. `during` images are stored now
> and reserved for the future three-stage / case-study view.

## ⚠️ Truthfulness / disclosure

The images currently installed here are **conceptual, AI-generated
presentation placeholders** derived from completed-project photography — they
are **not** verified historical documentation of the property. Their config
entries are therefore `enabled: false` (the section is hidden) and carry a
`disclosure` string:

> "Conceptual project visualization shown for design storytelling. Historical
> before and construction photography was not available."

Do **not** label conceptual imagery as verified original site conditions.
Replace a pair with genuine, verified before/after photography (same filenames)
before enabling it without that disclosure.

## Current placeholder mapping (all disabled)

| Slot | Source vignette | Project |
|------|-----------------|---------|
| project-01 | estate-pool | Southern Estate Pool & Courtyard — Estate Pool |
| project-02 | pool-terrace | Southern Estate Pool & Courtyard — Pool Terrace |
| project-03 | courtyard-spa | Southern Estate Pool & Courtyard — Courtyard Spa |

Project metadata (for when verified): Southern Estate Pool & Courtyard ·
Fairhope, Alabama · Services: Landscape Architecture & Design, Pool Design,
Hardscape Design, Planting Design, Outdoor Lighting, Irrigation, Project
Management.
