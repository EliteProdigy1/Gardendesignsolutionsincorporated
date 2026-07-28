/* ==========================================================================
   GDSI CASE STUDY SYSTEM — the single, editable data contract for the whole
   portfolio. Designed to scale to hundreds of projects. This is the "admin"
   surface: to publish a project you drop its media into
   assets/projects/<slug>/… and set `enabled: true`. Nothing renders publicly
   while a project is disabled, and only the sub-sections that HAVE data are
   shown (every section is data-driven).

   Per-project asset folders (assets/projects/<slug>/):
     plans/  before/  during/  after/  twilight/  drone/  details/  video/  pdf/

   ── Schema ────────────────────────────────────────────────────────────────
   slug           : string   — folder + future URL (/projects/<slug>).
   enabled        : boolean  — THE one flag that publishes the project.
   featured       : boolean  — Featured toggle (sorted first).
   status         : 'concept' | 'verified'  — 'concept' shows the disclosure and
                    makes no historical claims; 'verified' = real documentation.

   PROJECT INFORMATION
   name, city, completionYear (number|null — never invented), services[],
   categories[] (pools·courtyards·gardens·lighting·entrances), story (string|null).

   LANDSCAPE INFORMATION  (drives Project Specifications)
   plantPalette[]        — plant names.
   hardscapeMaterials[]  — materials.
   lightingSystem        — string|null.
   irrigation            — string|null.
   specialFeatures[]     — notable features.

   MEDIA  (each item = { src, alt }; arrays may be empty)
   media.plan          — { src, alt } single landscape plan image (Plan Viewer).
   media.pdf           — string path to a downloadable plan PDF (optional).
   media.video         — { src, poster, title } (optional).
   media.before[]      — Before photography.
   media.construction[]— During / construction photography (Construction Timeline).
   media.completedDay[]— Completed day photography.
   media.twilight[]    — Twilight photography.
   media.drone[]       — Drone photography.
   media.details[]     — Detail photography.

   comparisons[]  — Before/During/After slider sets: { label, before, during, after }.

   INTERACTIVE SECTIONS render automatically when their data exists:
     Plan Viewer (media.plan) · Before/During/After Slider (comparisons) ·
     Construction Timeline (media.construction) · Gallery (any gallery media) ·
     Project Specifications (landscape information) · Download PDF (media.pdf).

   Image spec: 3:2, 2400×1600 px or larger, matched camera angle for pairs.
   ========================================================================== */

const CONCEPT_DISCLOSURE =
  'Conceptual project visualization shown for design storytelling. Historical before and construction photography was not available.';

// helper: master path for a project's media (under assets/originals/…); the
// generator derives responsive AVIF/WebP from these via the media pipeline.
const media = (slug, stage, file) => `assets/originals/projects/${slug}/${stage}/${file}`;

const SLUG = 'southern-estate-pool-courtyard';

const PROJECTS = [
  {
    slug: SLUG,
    enabled: false,          // ← flip to true (with verified media) to publish
    featured: false,
    status: 'concept',

    // Project Information
    name: 'Southern Estate Pool & Courtyard',
    city: 'Fairhope, Alabama',
    completionYear: null,    // unknown — do not invent
    services: [
      'Landscape Architecture & Design',
      'Pool Design',
      'Hardscape Design',
      'Planting Design',
      'Outdoor Lighting',
      'Irrigation',
      'Project Management',
    ],
    categories: ['pools', 'courtyards', 'gardens', 'lighting', 'entrances'],
    story: null,             // write when verified

    // Landscape Information (drives Project Specifications) — fill when verified
    plantPalette: [],
    hardscapeMaterials: [],
    lightingSystem: null,
    irrigation: null,
    specialFeatures: [],

    // Media — galleries empty until verified photography is added to the folders
    media: {
      plan: null,            // { src: media(SLUG,'plans','plan.webp'), alt: '…' }
      pdf: null,             // media(SLUG,'pdf','landscape-plan.pdf')
      video: null,           // { src: media(SLUG,'video','tour.mp4'), poster: '…', title: '…' }
      before: [],
      construction: [],
      completedDay: [],
      twilight: [],
      drone: [],
      details: [],
    },

    // Before / During / After slider (uses the migrated conceptual imagery)
    disclosure: CONCEPT_DISCLOSURE,
    comparisons: [
      {
        label: 'Estate Pool',
        before: { src: media(SLUG, 'before', 'estate-pool.webp'), alt: 'Conceptual "before" view: a white Southern estate with an open, unplanted lawn.' },
        during: { src: media(SLUG, 'during', 'estate-pool.webp'), alt: 'Conceptual "during" view: the estate grounds under construction.' },
        after: { src: media(SLUG, 'after', 'estate-pool.webp'), alt: 'The estate with a rectilinear pool, stone terrace, clipped hedging and loungers in warm light.' },
      },
      {
        label: 'Pool Terrace',
        before: { src: media(SLUG, 'before', 'pool-terrace.webp'), alt: 'Conceptual "before" view: the estate grounds without the pool terrace.' },
        during: { src: media(SLUG, 'during', 'pool-terrace.webp'), alt: 'Conceptual "during" view: the pool terrace area under construction.' },
        after: { src: media(SLUG, 'after', 'pool-terrace.webp'), alt: 'A pool terrace with two loungers under white umbrellas beside reflecting water and trees.' },
      },
      {
        label: 'Courtyard Spa',
        before: { src: media(SLUG, 'before', 'courtyard-spa.webp'), alt: 'Conceptual "before" view: the covered courtyard area without the spa.' },
        during: { src: media(SLUG, 'during', 'courtyard-spa.webp'), alt: 'Conceptual "during" view: the courtyard under construction.' },
        after: { src: media(SLUG, 'after', 'courtyard-spa.webp'), alt: 'A covered stone loggia with an illuminated spa, lantern and planting at dusk.' },
      },
    ],
  },
  // ── Add further projects here ──────────────────────────────────────────────
  // Copy the block above, create assets/projects/<new-slug>/… , drop verified
  // media into the stage folders, fill the fields, and set enabled: true.
];

module.exports = { PROJECTS, CONCEPT_DISCLOSURE };
