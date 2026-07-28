/* ==========================================================================
   GDSI PROJECT SCHEMA  —  the single, editable source of truth for case-study
   / before-during-after projects. This is the "admin" surface: to publish a
   project you drop its photos into assets/images/before-after/ and set
   `enabled: true`. Nothing renders publicly while every project is disabled.

   Per-project fields
   ------------------
   enabled        : boolean  — THE one flag that publishes the project.
   featured       : boolean  — Featured toggle (pin / highlight).
   status         : 'concept' | 'verified'
                    'concept' → AI/placeholder imagery; the disclosure is shown
                    and no historical claims are made. 'verified' → real,
                    documented photography (no disclosure needed).
   name           : string   — Project Name.
   city           : string   — City (e.g., "Fairhope, Alabama").
   completionYear : number|null — Completion Year. Leave null until verified;
                    never invent a year.
   services       : string[] — Services Performed.
   categories     : string[] — Portfolio Categories (Built-Environments keys:
                    pools · courtyards · gardens · lighting · entrances).
   story          : string|null — Project Story (a paragraph). null until written.
   disclosure     : string|null — shown when status === 'concept'.
   comparisons    : [ { label, before, during, after } ]
                    Each comparison is one Before/During/After image set.
                    before/during/after = { src, alt }.  `during` is optional
                    and reserved for the future three-stage case-study view;
                    the live slider compares `before` ↔ `after`.

   Image requirements: 3:2, 2400×1600 px or larger, matched camera angle.
   ========================================================================== */

const CONCEPT_DISCLOSURE =
  'Conceptual project visualization shown for design storytelling. Historical before and construction photography was not available.';

const BA = 'assets/images/before-after';

const PROJECTS = [
  {
    enabled: false,          // ← flip to true (with verified photography) to publish
    featured: false,
    status: 'concept',
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
    story: null,             // Project Story — write when verified
    disclosure: CONCEPT_DISCLOSURE,
    comparisons: [
      {
        label: 'Estate Pool',
        before: { src: BA + '/project-01-before.webp', alt: 'Conceptual "before" view: a white Southern estate with an open, unplanted lawn.' },
        during: { src: BA + '/project-01-during.webp', alt: 'Conceptual "during" view: the estate grounds under construction.' },
        after: { src: BA + '/project-01-after.webp', alt: 'The estate with a rectilinear pool, stone terrace, clipped hedging and loungers in warm light.' },
      },
      {
        label: 'Pool Terrace',
        before: { src: BA + '/project-02-before.webp', alt: 'Conceptual "before" view: the estate grounds without the pool terrace.' },
        during: { src: BA + '/project-02-during.webp', alt: 'Conceptual "during" view: the pool terrace area under construction.' },
        after: { src: BA + '/project-02-after.webp', alt: 'A pool terrace with two loungers under white umbrellas beside reflecting water and trees.' },
      },
      {
        label: 'Courtyard Spa',
        before: { src: BA + '/project-03-before.webp', alt: 'Conceptual "before" view: the covered courtyard area without the spa.' },
        during: { src: BA + '/project-03-during.webp', alt: 'Conceptual "during" view: the courtyard under construction.' },
        after: { src: BA + '/project-03-after.webp', alt: 'A covered stone loggia with an illuminated spa, lantern and planting at dusk.' },
      },
    ],
  },
  // Add further projects here. Copy the block above, drop matched webp into
  // assets/images/before-after/, fill the fields, and set enabled: true.
];

module.exports = { PROJECTS, CONCEPT_DISCLOSURE };
