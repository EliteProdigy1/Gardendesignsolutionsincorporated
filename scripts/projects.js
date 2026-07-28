/* ==========================================================================
   GDSI PROJECT ENGINE — the single, editable data contract for the whole
   portfolio. One project = one record here. Nothing about a project is ever
   duplicated inside a page template; every surface (homepage cards, featured
   rail, category filters, related rail, project page, sitemap, structured
   data, Open Graph) is derived from these records.

   Designed to scale to hundreds of projects. To PUBLISH a project you:
     1. Drop its media into  assets/originals/projects/<slug>/<stage>/…
     2. Run  npm run media   (generates AVIF/WebP/srcset for the new masters)
     3. Fill the record below and set  enabled: true
     4. Run  npm run build   (regenerates homepage, /projects/<slug>/, sitemap)

   Per-project asset stages (assets/originals/projects/<slug>/):
     plans/ before/ during/ after/ completed/ twilight/ drone/ details/ video/ pdf/

   ── HONESTY RULES (enforced, never bypass) ────────────────────────────────
   • Never invent business facts: names, addresses, completion years, awards,
     testimonials, statistics, team names, plant/material lists.
   • status:'concept' → the disclosure renders and NO historical claim is made.
     Conceptual/AI imagery must never be presented as documented "before"
     photography. status:'verified' → real documentation only.
   • Empty fields and empty sections never render.
   • Do NOT set enabled:true on a concept project without explicit instruction.
   ========================================================================== */

const CONCEPT_DISCLOSURE =
  'Conceptual project visualization shown for design storytelling. Historical before and construction photography was not available.';

// Master path for a project's media (under assets/originals/…). The media
// pipeline derives responsive AVIF/WebP from these.
const media = (slug, stage, file) => `assets/originals/projects/${slug}/${stage}/${file}`;

/* ── Schema reference ───────────────────────────────────────────────────────
   IDENTITY      id (stable, never reused) · slug (folder + /projects/<slug>/ URL)
   FLAGS         enabled · featured · status ('concept'|'verified')
   INFO          name · city · completionYear(number|null) · services[] · categories[]
   NARRATIVE     intro · challenge · vision · process · craft · outcome · story  (all string|null)
   MEDIA         media.{ hero, plan, pdf, video, before[], during[], after[],
                          completed[], twilight[], drone[], details[] }
                 each image item = { src, alt }; hero = { src, alt }
                 plan = { src, alt, callouts[] }  (callouts reserved for the
                         future interactive plan viewer; see planCallout shape)
   LANDSCAPE     plantPalette[] · hardscapeMaterials[] · lightingSystem · irrigation · specialFeatures[]
   COMPARISONS   comparisons[] = { label, before:{src,alt}, during:{src,alt}, after:{src,alt} }
   CREDITS       photographer · designer · builder · architect  (string|null)
   PROOF         testimonials[] = { quote, attribution } · awards[] = { title, source, year|null }
   RELATIONS     related[] = project ids (auto-falls back to same-category if empty)
   SEO/SOCIAL    seo.title · seo.description · seo.socialImage (master src|null)

   planCallout (reserved, not yet rendered): { x, y, type:'plant'|'material'|'lighting'|'timeline', label, detail }
   ────────────────────────────────────────────────────────────────────────── */

// Normalizer — guarantees every field exists with a safe default so partial
// records are safe and empty sections simply never render.
function defineProject(p) {
  const m = p.media || {};
  const seo = p.seo || {};
  return {
    id: p.id,
    slug: p.slug,
    enabled: p.enabled === true,
    featured: p.featured === true,
    status: p.status === 'verified' ? 'verified' : 'concept',

    name: p.name || '',
    city: p.city || null,
    completionYear: typeof p.completionYear === 'number' ? p.completionYear : null,
    services: p.services || [],
    categories: p.categories || [],

    intro: p.intro || null,
    challenge: p.challenge || null,
    vision: p.vision || null,
    process: p.process || null,
    craft: p.craft || null,
    outcome: p.outcome || null,
    story: p.story || null,

    media: {
      hero: m.hero || null,
      plan: m.plan || null,
      pdf: m.pdf || null,
      video: m.video || null,
      before: m.before || [],
      during: m.during || m.construction || [],
      after: m.after || [],
      completed: m.completed || m.completedDay || [],
      twilight: m.twilight || [],
      drone: m.drone || [],
      details: m.details || [],
    },

    plantPalette: p.plantPalette || [],
    hardscapeMaterials: p.hardscapeMaterials || [],
    lightingSystem: p.lightingSystem || null,
    irrigation: p.irrigation || null,
    specialFeatures: p.specialFeatures || [],

    comparisons: p.comparisons || [],

    photographer: p.photographer || null,
    designer: p.designer || null,
    builder: p.builder || null,
    architect: p.architect || null,

    testimonials: p.testimonials || [],
    awards: p.awards || [],
    related: p.related || [],

    disclosure: p.disclosure || (p.status === 'verified' ? null : CONCEPT_DISCLOSURE),
    seo: {
      title: seo.title || null,
      description: seo.description || null,
      socialImage: seo.socialImage || null,
    },
  };
}

const SLUG = 'southern-estate-pool-courtyard';

/* Raw records. Add a new object, run the 4-step publish flow above. */
const RAW = [
  {
    id: 'gdsi-0001',
    slug: SLUG,
    enabled: false,            // ← concept work: stays hidden until instructed
    featured: false,
    status: 'concept',

    name: 'Southern Estate Pool & Courtyard',
    city: 'Fairhope, Alabama',
    completionYear: null,      // unknown — never invented
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

    // Narrative — write only when verified with the client.
    intro: null,
    challenge: null,
    vision: null,
    process: null,
    craft: null,
    outcome: null,
    story: null,

    // Landscape information — fill when verified.
    plantPalette: [],
    hardscapeMaterials: [],
    lightingSystem: null,
    irrigation: null,
    specialFeatures: [],

    media: {
      hero: null,              // { src: media(SLUG,'after','estate-pool.webp'), alt: '…' }
      plan: null,              // { src, alt, callouts: [] }
      pdf: null,
      video: null,
      before: [], during: [], after: [], completed: [], twilight: [], drone: [], details: [],
    },

    // Credits / proof — never invented.
    photographer: null, designer: null, builder: null, architect: null,
    testimonials: [], awards: [], related: [],

    // Before / During / After (conceptual imagery; disclosure shown).
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
    seo: { title: null, description: null, socialImage: null },
  },
  // ── Add further projects here ──────────────────────────────────────────────
  // Copy the block above, give it a NEW stable id, create
  // assets/originals/projects/<new-slug>/…, run `npm run media`, fill the
  // fields, set enabled:true, then `npm run build`.
];

const PROJECTS = RAW.map(defineProject);

/* ---- Query helpers (used by every derived output) ------------------------- */
const byId = (id) => PROJECTS.find((p) => p.id === id) || null;
const getEnabled = () => PROJECTS.filter((p) => p.enabled);
const getFeatured = () => getEnabled().filter((p) => p.featured);
const getBySlug = (slug) => PROJECTS.find((p) => p.slug === slug && p.enabled) || null;

// Related projects: explicit ids first, then same-category enabled projects,
// capped. Never returns the project itself or a disabled one.
function relatedTo(project, limit) {
  limit = limit || 3;
  const out = [];
  const push = (p) => { if (p && p.enabled && p.id !== project.id && out.indexOf(p) === -1) out.push(p); };
  (project.related || []).forEach((id) => push(byId(id)));
  if (out.length < limit) {
    getEnabled().forEach((p) => {
      if (out.length >= limit) return;
      if (p.id === project.id) return;
      if ((p.categories || []).some((c) => (project.categories || []).indexOf(c) !== -1)) push(p);
    });
  }
  return out.slice(0, limit);
}

module.exports = {
  PROJECTS, CONCEPT_DISCLOSURE, defineProject,
  byId, getEnabled, getFeatured, getBySlug, relatedTo,
};
