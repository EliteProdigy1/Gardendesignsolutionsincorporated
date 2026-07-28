# GDSI Project Engine — how to publish a project

The whole portfolio is data-driven from **one file**: `scripts/projects.js`.
Every surface — the homepage "Selected projects" rail, category filters,
related-project rails, the `/projects/<slug>/` case-study page, the XML sitemap,
Open Graph / Twitter cards, and JSON-LD structured data — is generated from
these records. You never hand-write a project page.

## Add the next project (the whole workflow)

1. **Create the asset folders** and drop in the master images (keep originals):

   ```
   assets/originals/projects/<slug>/
     plans/  before/  during/  after/  completed/  twilight/  drone/  details/  video/  pdf/
   ```

   Use 3:2 masters, 2400×1600 px or larger. For a Before/During/After pair,
   shoot the same camera angle.

2. **Generate responsive derivatives** (AVIF + WebP + srcset + thumbnails):

   ```
   npm run media
   ```

   Masters are never modified; the run is idempotent.

3. **Add the record** in `scripts/projects.js` — copy the existing block, give
   it a **new stable `id`** (never reuse one), fill the fields you have, and set
   `enabled: true`. Leave any field you don't have empty — empty fields and
   empty sections simply never render.

4. **Build**:

   ```
   npm run build
   ```

   This regenerates `index.html`, writes `projects/<slug>/index.html`, and
   rebuilds `sitemap.xml`. Commit and push to `main`; Netlify deploys.

## Honesty rules (enforced — never bypass)

- Never invent facts: names, addresses, completion years, awards, testimonials,
  statistics, team names, plant/material lists.
- `status: 'concept'` shows the disclosure and makes **no** historical claim.
  Conceptual/AI imagery must never be presented as documented "before" photos.
  `status: 'verified'` is for real documentation only.
- Do **not** set `enabled: true` on a concept project without explicit sign-off.

## Fields (all optional except id/slug/name)

`id · slug · enabled · featured · status` · `name · city · completionYear ·
services[] · categories[]` · narrative `intro · challenge · vision · process ·
craft · outcome · story` · `media.{ hero, plan, pdf, video, before[], during[],
after[], completed[], twilight[], drone[], details[] }` · landscape
`plantPalette[] · hardscapeMaterials[] · lightingSystem · irrigation ·
specialFeatures[]` · `comparisons[]` (Before/During/After) · credits
`photographer · designer · builder · architect` · `testimonials[] · awards[] ·
related[]` · `seo.{ title, description, socialImage }`.

`categories` are: `pools · courtyards · gardens · lighting · entrances`.
`related` takes project `id`s; if empty it falls back to same-category projects.

---

## Architecture map

| Concern | File |
| --- | --- |
| Site constants + shared rendering + page chrome | `scripts/lib.js` |
| Project data (the one editable source) | `scripts/projects.js` |
| Homepage generator | `scripts/build-gdsi.js` |
| Reusable project-page generator | `scripts/build-projects.js` |
| Derived sitemap | `scripts/build-sitemap.js` |
| Media pipeline (masters → AVIF/WebP/srcset) | `scripts/media-pipeline.js` |
| Design tokens + components | `assets/css/styles.css` (`:root`) |
| Interactions (one reveal/lightbox/slider system) | `assets/js/main.js` |

---

## Deferred to the EP Website Factory roadmap (do not block launch)

These are intentionally **not** built here; the schemas/interfaces above are
kept clean so they can be added later without a rewrite:

- CMS / admin dashboard, client portal, approval workflows, revision history
- Full plant database, full material database, internal asset manager
- Automated social-crop production, email campaign generator, analytics dashboard
- Interactive plan **callouts** (plant/material/lighting/timeline) — the data
  hook exists today as `media.plan.callouts[]`; the overlay UI is future work.
- Site-wide search index, geographic project map, construction-archive app
