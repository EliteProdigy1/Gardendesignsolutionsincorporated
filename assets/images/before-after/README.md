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

Everything is driven by the `BEFORE_AFTER` array in the site generator
(`scripts/build-gdsi.js`). To publish a pair:

1. Put the matched `-before.webp` and `-after.webp` in this folder.
2. In `BEFORE_AFTER`, set the entry's `enabled: true` and fill in
   `title`, `category`, and `before.alt` / `after.alt`.
3. Rebuild. The whole **Before & After section stays hidden while every entry
   is `enabled: false`**, and appears automatically once at least one is enabled.

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
