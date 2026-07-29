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
    address: p.address || null,       // full street address (only if already published/approved)
    completionYear: typeof p.completionYear === 'number' ? p.completionYear : null,
    designYear: typeof p.designYear === 'number' ? p.designYear : null,   // plan/drawing year — never implies "built"
    kind: p.kind === 'plan-study' ? 'plan-study' : 'built',               // 'plan-study' leads with the drawing
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
  /* ────────────────────────────────────────────────────────────────────────
     FLAGSHIP LANDSCAPE-ARCHITECTURE STUDIES
     Verified from the client's own hand-rendered GDSI plans (landscape
     architect Paul Fontenot). These are DESIGN plans — not photographed
     completed builds — so each page leads with the drawing (kind:'plan-study'),
     names the architect, and lists only planting/features read directly from
     the plan. No completion is claimed; no before/after; no invented facts.
     ──────────────────────────────────────────────────────────────────────── */
  {
    id: 'gdsi-plan-connolly',
    slug: 'connolly-residence',
    enabled: true, featured: true, status: 'verified', kind: 'plan-study',
    name: 'The Connolly Residence',
    city: 'Gulf Breeze, Florida',
    address: "736 Peake's Point Drive · Gulf Breeze, Florida",
    completionYear: null, designYear: 2021,
    services: ['Landscape Architecture & Design', 'Planting Design', 'Pool Design', 'Hardscape Design'],
    categories: ['pools', 'gardens', 'entrances'],
    architect: 'Paul Fontenot, GDSI',
    designer: 'Garden Design Solutions, Inc.',
    intro: "A hand-rendered landscape plan for a waterfront residence on Peake's Point Drive, drawn by GDSI landscape architect Paul Fontenot. The design frames the house between a formal motor-court arrival and a pool terrace addressing the bay channel, wrapped in a layered evergreen palette.",
    vision: 'A measured composition that carries the eye from the arrival court, along planted walks, to the water — resolving pool, terrace and garden as a single waterfront room.',
    hardscapeMaterials: ['Motor court', 'Pool with stucco-column water feature', 'Covered porches', 'Stucco columns', 'Retaining walls', 'Waterfront terrace (bay channel)'],
    plantPalette: ['European Olive', "Nelle R. Stevens Holly", 'Japanese Yew', 'Asian Jasmine', "Hydrangea 'Limelight'", 'Agapanthus', 'Creeping Rosemary', 'Viburnum Suspensum', 'Eagleston Holly', "Loropetalum 'Platinum Beauty'", 'Camellia Japonica', 'Gardenia', 'Dwarf Pittosporum', "Crape Myrtle 'White'", 'Dwarf Cryptomeria', 'Boxwood', "Drift Roses 'White'", 'African Iris'],
    media: {
      plan: { src: 'assets/originals/renderings/connolly-residence-plan-gulf-breeze-fl.webp', alt: 'Hand-rendered landscape plan for the Connolly Residence on the bay channel in Gulf Breeze, Florida — motor court, planted grounds and a waterfront pool.', callouts: [] },
    },
    seo: {
      title: 'The Connolly Residence — Waterfront Landscape Plan · Gulf Breeze, FL | GDSI',
      description: 'A hand-rendered GDSI landscape architecture plan for a waterfront residence in Gulf Breeze, Florida — pool terrace, motor court and a layered coastal planting palette by Paul Fontenot.',
      socialImage: 'assets/originals/renderings/connolly-residence-plan-gulf-breeze-fl.webp',
    },
  },
  {
    id: 'gdsi-plan-roberts',
    slug: 'roberts-residence',
    enabled: true, featured: true, status: 'verified', kind: 'plan-study',
    name: 'The Roberts Residence',
    city: 'Fairhope, Alabama',
    address: '14243 Scenic Hwy 98 · Fairhope, Alabama',
    completionYear: null, designYear: 2022,
    services: ['Landscape Architecture & Design', 'Planting Design', 'Pool & Spa Design', 'Hardscape Design'],
    categories: ['pools', 'gardens', 'courtyards', 'entrances'],
    architect: 'Paul Fontenot, GDSI',
    designer: 'Garden Design Solutions, Inc.',
    intro: 'A hand-rendered landscape plan for an estate on Mobile Bay along Scenic Highway 98, drawn by GDSI landscape architect Paul Fontenot. The design sets a formal motor court and parterre garden against a bayfront pool, spa and pool house.',
    vision: 'A symmetrical, axial plan that gathers arrival, garden and waterfront into one calm, formal sequence from the highway to the bay.',
    hardscapeMaterials: ['Formal motor court', 'Pool and spa', 'Pool house', 'Parterre garden', 'Brick walks', 'Retaining walls', 'Waterfront frontage (Mobile Bay)'],
    plantPalette: ['Eagleston Holly', 'Blue Hydrangea', 'Japanese Anise', 'Variegated Liriope', "Loropetalum 'Platinum Beauty'", "Dwarf Sasanqua 'White'", 'Boxwood', 'Asian Jasmine', 'Gardenia', 'Italian Cypress', 'Holly Fern', 'Indica Azalea', "Liriope 'Emerald Goddess'", 'Crape Myrtle', "Hydrangea 'Limelight'", 'Split-leaf Philodendron', 'Dwarf Ruellia'],
    media: {
      plan: { src: 'assets/originals/renderings/roberts-residence-plan-fairhope-al.webp', alt: 'Hand-rendered landscape plan for the Roberts Residence on Mobile Bay in Fairhope, Alabama — formal motor court, parterre garden and a bayfront pool, spa and pool house.', callouts: [] },
    },
    seo: {
      title: 'The Roberts Residence — Bayfront Landscape Plan · Fairhope, AL | GDSI',
      description: 'A hand-rendered GDSI landscape architecture plan for a Mobile Bay estate in Fairhope, Alabama — pool, spa, pool house, formal motor court and parterre garden by Paul Fontenot.',
      socialImage: 'assets/originals/renderings/roberts-residence-plan-fairhope-al.webp',
    },
  },
  {
    id: 'gdsi-plan-tays',
    slug: 'tays-memorial-garden',
    enabled: true, featured: true, status: 'verified', kind: 'plan-study',
    name: "Tay's Memorial Garden",
    city: 'Mobile, Alabama',
    address: '251 Tuthill Lane · Mobile, Alabama',
    completionYear: null, designYear: 2022,
    services: ['Landscape Architecture & Design', 'Planting Design', 'Hardscape Design'],
    categories: ['gardens', 'courtyards'],
    architect: 'Paul Fontenot, GDSI',
    designer: 'Garden Design Solutions, Inc.',
    intro: 'A hand-rendered plan for a formal memorial garden in Mobile, drawn by GDSI landscape architect Paul Fontenot. The garden is organized on a cross axis around a central fountain, enclosed by clipped hedges and brick walks between Old Shell Road and Tuthill Lane.',
    vision: 'A quiet, symmetrical memorial garden — green rooms gathered around a central fountain and a wall fountain, framed for stillness.',
    hardscapeMaterials: ['Central fountain', 'Wall fountain', 'Cross-axis brick walks', 'Brick borders', 'Stucco columns', 'Low fence with brick columns', 'Formal lawns'],
    plantPalette: ['Asian Jasmine', 'Loropetalum', 'Camellia Japonica', 'Chinese Privet (tree form)', "Indica Azalea 'Gerbing'", 'Dwarf Boxwood'],
    media: {
      plan: { src: 'assets/originals/renderings/tays-memorial-garden-plan-mobile-al.webp', alt: "Hand-rendered landscape plan for Tay's Memorial Garden in Mobile, Alabama — a formal, symmetrical garden organized around a central fountain with cross-axis brick walks and clipped hedges.", callouts: [] },
    },
    seo: {
      title: "Tay's Memorial Garden — Formal Garden Plan · Mobile, AL | GDSI",
      description: "A hand-rendered GDSI landscape architecture plan for a formal memorial garden in Mobile, Alabama — a symmetrical, cross-axis composition around a central fountain by Paul Fontenot.",
      socialImage: 'assets/originals/renderings/tays-memorial-garden-plan-mobile-al.webp',
    },
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
