/* GDSI static site generator — emits index.html + assets/manifest.json.
   Production asset layout: assets/{css,js,hero,projects,renderings,...}. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// Repo root (this file lives in <repo>/scripts). Run with: node scripts/build-gdsi.js
const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'index.html');

// Content-hash the CSS/JS so their URLs change whenever they change — busts
// browser caches on every deploy (no stale stylesheet after an edit).
const hashOf = (rel) => crypto.createHash('md5').update(fs.readFileSync(path.join(REPO, rel))).digest('hex').slice(0, 8);
const CSS_V = hashOf('assets/css/styles.css');
const JS_V = hashOf('assets/js/main.js');

// Built Environments categories — completed spaces, grouped by what they are.
const CATS = [
  { key: 'pools',      label: 'Pools' },
  { key: 'courtyards', label: 'Courtyards' },
  { key: 'gardens',    label: 'Gardens' },
  { key: 'lighting',   label: 'Lighting' },
  { key: 'entrances',  label: 'Estate Entrances' },
];

// Built Environments items: [category, file(under assets/projects), w, h, alt]
const ITEMS = [
  ['pools', 'water-luxury-pool-courtyard.webp', 1451, 1084, 'A luxury pool set within a landscaped courtyard.'],
  ['pools', 'water-pool-spa-stone-waterwall.webp', 1448, 1086, 'A pool and spa with a stone water wall.'],
  ['pools', 'water-estate-swimming-pool.webp', 1448, 1086, 'An estate swimming pool on a clear day.'],
  ['pools', 'water-backyard-family-pool.webp', 1448, 1086, 'A backyard family pool in bright daylight.'],
  ['pools', 'water-covered-spa-twilight.webp', 1537, 1023, 'A covered spa beside the pool at twilight.'],
  ['pools', 'estate-pool-golden-hour.webp', 1448, 1086, 'An estate and pool bathed in golden-hour light.'],

  ['courtyards', 'planting-courtyard-japanese-maple.webp', 1405, 1120, 'A courtyard planting anchored by a Japanese maple.'],
  ['courtyards', 'water-sculpture-reflecting-pool.webp', 1254, 1254, 'A sculptural reflecting pool in a modern courtyard.'],
  ['courtyards', 'hardscape-white-brick-courtyard.webp', 1448, 1086, 'A bright white-brick courtyard with paved surfaces.'],
  ['courtyards', 'hardscape-modern-courtyard-paving.webp', 1270, 1239, 'A modern courtyard with clean paved hardscape.'],

  ['gardens', 'planting-coastal-hydrangea-garden-path.webp', 1448, 1086, 'A coastal garden pathway bordered by blooming hydrangeas.'],
  ['gardens', 'planting-formal-front-garden.webp', 1448, 1086, 'A symmetrical formal front garden with clipped hedging.'],
  ['gardens', 'planting-privacy-hedge-walkway.webp', 1241, 1268, 'A garden walkway screened by a tall privacy hedge.'],
  ['gardens', 'planting-southern-home-live-oaks.webp', 1455, 1081, 'A stately Southern home shaded by mature live oaks.'],
  ['gardens', 'water-formal-garden-fountain.webp', 1254, 1254, 'A symmetrical garden fountain surrounded by planting.'],
  ['gardens', 'estate-manicured-lawn.webp', 1122, 1402, 'An estate framed by an expansive manicured lawn.'],
  ['gardens', 'estate-aerial-grounds.webp', 1448, 1086, 'An aerial view of a landscaped estate and grounds.'],

  ['lighting', 'lighting-infinity-pool-night.webp', 1448, 1086, 'An infinity pool illuminated after dark.'],
  ['lighting', 'lighting-pool-edge-night.webp', 1448, 1086, 'Warm edge lighting around a pool at night.'],
  ['lighting', 'lighting-courtyard-uplighting-dusk.webp', 1448, 1086, 'Courtyard plantings and walls accented with uplighting at dusk.'],
  ['lighting', 'lighting-stone-facade-night.webp', 1229, 1280, 'A stone facade washed with exterior lighting at night.'],
  ['lighting', 'lighting-architectural-columns-night.webp', 1254, 1254, 'Architectural columns lit at night.'],

  ['entrances', 'planting-formal-estate-drive.webp', 1448, 1086, 'A formal estate drive framed by manicured plantings.'],
  ['entrances', 'hardscape-brick-garden-gateway.webp', 1448, 1086, 'A brick garden gateway framing the entrance.'],
  ['entrances', 'hardscape-brick-entry-fountain.webp', 1132, 1390, 'A brick entryway with a stone fountain.'],
  ['entrances', 'estate-white-front-elevation.webp', 1448, 1086, 'The front elevation of a white estate with formal landscaping.'],
  ['entrances', 'estate-architectural-detail.webp', 1086, 1448, 'A close architectural detail of an estate exterior.'],
];

// Named landscape plans — names/addresses verified from the client's own GDSI drawings.
const PLANS = [
  ['renderings/tays-memorial-garden-plan-mobile-al.webp', 994, 1496, "Tay's Memorial Garden", '251 Tuthill Lane · Mobile, Alabama', "Landscape plan for Tay's Memorial Garden, a formal memorial garden in Mobile, Alabama."],
  ['renderings/roberts-residence-plan-fairhope-al.webp', 994, 1994, 'The Roberts Residence', '14243 Scenic Hwy 98 · Fairhope, Alabama', 'Landscape plan for the Roberts Residence on Mobile Bay in Fairhope, Alabama.'],
  ['renderings/connolly-residence-plan-gulf-breeze-fl.webp', 1490, 991, 'The Connolly Residence', "736 Peake's Point Drive · Gulf Breeze, Florida", 'Landscape plan for the Connolly Residence on the bay channel in Gulf Breeze, Florida.'],
];
const TAYS = 'renderings/tays-memorial-garden-plan-mobile-al.webp';

/* ==========================================================================
   Before & After comparison slider — data-driven framework.
   The whole section stays HIDDEN while every entry is `enabled:false`.
   To publish a pair: drop matched -before/-after webp in assets/images/before-after,
   set enabled:true, and fill title/category/alt. Supports 3–5 pairs.
   ========================================================================== */
const BA_DISCLOSURE = 'Conceptual project visualization shown for design storytelling. Historical before and construction photography was not available.';
const BA = 'assets/images/before-after';
// NOTE: these entries are DISABLED placeholders. The images are conceptual
// AI-generated visualizations, not verified historical documentation, so the
// section is hidden until verified before/after photography replaces them.
const BEFORE_AFTER = [
  {
    id: 'project-01', enabled: false, status: 'concept',
    title: 'Southern Estate Pool & Courtyard', category: 'Estate Pool · Fairhope, Alabama',
    disclosure: BA_DISCLOSURE,
    before: { src: BA + '/project-01-before.webp', alt: 'Conceptual "before" view: a white Southern estate with an open, unplanted lawn.' },
    after: { src: BA + '/project-01-after.webp', alt: 'The estate with a rectilinear pool, stone terrace, clipped hedging and loungers in warm light.' },
  },
  {
    id: 'project-02', enabled: false, status: 'concept',
    title: 'Southern Estate Pool & Courtyard', category: 'Pool Terrace · Fairhope, Alabama',
    disclosure: BA_DISCLOSURE,
    before: { src: BA + '/project-02-before.webp', alt: 'Conceptual "before" view: the estate grounds without the pool terrace.' },
    after: { src: BA + '/project-02-after.webp', alt: 'A pool terrace with two loungers under white umbrellas beside reflecting water and trees.' },
  },
  {
    id: 'project-03', enabled: false, status: 'concept',
    title: 'Southern Estate Pool & Courtyard', category: 'Courtyard Spa · Fairhope, Alabama',
    disclosure: BA_DISCLOSURE,
    before: { src: BA + '/project-03-before.webp', alt: 'Conceptual "before" view: the covered courtyard area without the spa.' },
    after: { src: BA + '/project-03-after.webp', alt: 'A covered stone loggia with an illuminated spa, lantern and planting at dusk.' },
  },
  // Add project-04 / project-05 here as verified pairs arrive.
];

function baFigure(e, i) {
  const eager = i === 0; // first comparison may load eagerly; rest lazy
  const load = eager ? '' : ' loading="lazy"';
  const disc = e.disclosure ? `\n        <p class="ba-disclosure">${esc(e.disclosure)}</p>` : '';
  const cat = e.category ? `<span class="ba-cat">${esc(e.category)}</span>` : '';
  return `      <figure class="ba reveal">
        <div class="ba-frame" data-ba style="--pos:50%">
          <img class="ba-img ba-after" src="${e.after.src}" width="2400" height="1600" alt="${esc(e.after.alt)}"${load} decoding="async">
          <img class="ba-img ba-before" src="${e.before.src}" width="2400" height="1600" alt="${esc(e.before.alt)}"${load} decoding="async">
          <span class="ba-label ba-label--before" aria-hidden="true">Before</span>
          <span class="ba-label ba-label--after" aria-hidden="true">After</span>
          <span class="ba-divider" aria-hidden="true"></span>
          <button class="ba-handle" type="button" role="slider" aria-label="Reveal before or after — ${esc(e.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
            <span aria-hidden="true">&#8249;&#8250;</span>
          </button>
        </div>
        <figcaption class="ba-cap">
          ${cat}
          <span class="ba-title">${esc(e.title)}</span>${disc}
        </figcaption>
      </figure>`;
}

function beforeAfterSection() {
  const live = BEFORE_AFTER.filter((e) => e.enabled);
  if (!live.length) return ''; // hidden until at least one verified pair is enabled
  return `
  <!-- BEFORE & AFTER -->
  <section class="beforeafter section" id="before-after" aria-labelledby="ba-title">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Before &amp; after</p>
        <h2 class="display" id="ba-title">The transformation.</h2>
        <p class="section-lede">Drag, or use the arrow keys, to move between the two states of each space.</p>
      </div>
      <div class="ba-grid">
${live.map(baFigure).join('\n')}
      </div>
    </div>
  </section>
`;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const labelFor = (k) => CATS.find((c) => c.key === k).label;

function figure(it) {
  const [cat, file, w, h, alt] = it;
  return `        <figure class="tile reveal" data-cat="${cat}" style="aspect-ratio:${w}/${h}">
          <button class="tile-btn" type="button" data-group="built" data-full="assets/projects/${file}" data-alt="${esc(alt)}" data-caption="${labelFor(cat)}" aria-label="View larger: ${esc(alt)}">
            <img src="assets/projects/${file}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async">
            <span class="tile-meta"><span class="tile-cat">${labelFor(cat)}</span></span>
          </button>
        </figure>`;
}

function planCard(p) {
  const [file, w, h, title, meta, alt] = p;
  return `        <button class="plan reveal" type="button" data-group="plans" data-full="assets/${file}" data-alt="${esc(alt)}" data-caption="${esc(title)} — ${esc(meta)}" aria-label="Open plan: ${esc(title)}, ${esc(meta)}">
          <span class="plan-img"><img src="assets/${file}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async"></span>
          <span class="plan-body">
            <span class="plan-title">${esc(title)}</span>
            <span class="plan-meta">${esc(meta)}</span>
            <span class="plan-cta">View plan<span aria-hidden="true"> ⤢</span></span>
          </span>
        </button>`;
}

// Services (five disciplines + full estate). [jump, filterKey|'', image(under assets/projects), title, copy]
const SERVICES = [
  ['#built', 'gardens', 'projects/planting-coastal-hydrangea-garden-path.webp', 'Planting Design', 'Seasonal structure, native and coastal palettes, and living architecture composed to settle into its site.'],
  ['#built', 'pools', 'projects/water-luxury-pool-courtyard.webp', 'Water Features & Pools', 'Pools, spas, fountains and reflecting water composed as the quiet centre of an outdoor room.'],
  ['#built', 'lighting', 'projects/lighting-courtyard-uplighting-dusk.webp', 'Lighting', 'Layered exterior lighting that lets a garden change character from dusk into full night.'],
  ['#built', 'courtyards', 'projects/hardscape-white-brick-courtyard.webp', 'Hardscapes', 'Terraces, courtyards, walls and gateways in brick and stone that give a landscape its bones.'],
  ['#architecture', '', 'renderings/tays-memorial-garden-plan-mobile-al.webp', 'Landscape Architecture', 'Measured, hand-rendered plans that let a whole property be understood before a spade is lifted.'],
  ['#built', '', 'projects/estate-pool-golden-hour.webp', 'Full Estate Landscapes', 'Whole-property design and construction carried from the first drawing to the finished ground.'],
];

function serviceCard(s, i) {
  const [jump, filter, file, title, copy] = s;
  const n = String(i + 1).padStart(2, '0');
  const attr = filter ? ` data-jump="${filter}"` : '';
  return `        <a class="svc reveal" href="${jump}"${attr}>
          <span class="svc-img"><img src="assets/${file}" alt="" loading="lazy" decoding="async"></span>
          <span class="svc-body">
            <span class="svc-num">${n}</span>
            <span class="svc-title">${title}</span>
            <span class="svc-copy">${copy}</span>
            <span class="svc-cta">Explore<span aria-hidden="true"> →</span></span>
          </span>
        </a>`;
}

const PROCESS = [
  ['Enquiry & brief', 'We begin with the property and the people — how the garden will be lived in, and what it should become.'],
  ['Reading the site', 'Light, grade, soil, drainage, prevailing views and existing planting are surveyed before a line is drawn.'],
  ['Concept & masterplan', 'A measured plan sets the structure, circulation and planting rhythm for the whole property.'],
  ['Design development', 'Materials, water, lighting and planting palettes are resolved in detail and rendered for review.'],
  ['Construction', 'Hardscape, water features and planting are built with careful craft and close supervision.'],
  ['Establishment', 'The garden is settled in and tended so that, in time, it reads as though it always belonged.'],
];
function processStep(p, i) {
  const [title, copy] = p;
  const n = String(i + 1).padStart(2, '0');
  return `        <li class="step reveal">
          <span class="step-num">${n}</span>
          <div class="step-body">
            <h3 class="step-title">${title}</h3>
            <p class="step-copy">${copy}</p>
          </div>
        </li>`;
}

const chips = [`<button class="chip is-active" type="button" data-filter="all" aria-pressed="true">All work</button>`]
  .concat(CATS.map((c) => `<button class="chip" type="button" data-filter="${c.key}" aria-pressed="false">${c.label}</button>`))
  .join('\n          ');

const tiles = ITEMS.map(figure).join('\n');
const plans = PLANS.map(planCard).join('\n');
const services = SERVICES.map(serviceCard).join('\n');
const steps = PROCESS.map(processStep).join('\n');

const HERO = 'hero/hero-luxury-estate-pool-twilight.webp';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Garden Design Solutions, Inc. — Residential Landscape Design &amp; Construction</title>
  <meta name="description" content="Garden Design Solutions, Inc. (GDSI) has designed and built residential landscapes along the Gulf Coast since 2002 — planting design, pools and water features, lighting, hardscapes and hand-rendered landscape plans.">
  <meta name="theme-color" content="#24352A">
  <link rel="canonical" href="https://gdsi.netlify.app/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Garden Design Solutions, Inc.">
  <meta property="og:description" content="Residential landscape design & construction along the Gulf Coast since 2002.">
  <meta property="og:image" content="https://gdsi.netlify.app/assets/${HERO}">
  <meta property="og:url" content="https://gdsi.netlify.app/">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="image" href="assets/${HERO}" fetchpriority="high">
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/styles.css?v=${CSS_V}">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Garden Design Solutions, Inc.",
    "alternateName": "GDSI",
    "description": "Residential landscape design and construction along the Gulf Coast since 2002.",
    "url": "https://gdsi.netlify.app/",
    "areaServed": "Gulf Coast",
    "foundingDate": "2002",
    "knowsAbout": ["Planting Design", "Water Features", "Pools", "Landscape Lighting", "Hardscapes", "Landscape Renderings"]
  }
  </script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

<header class="nav" id="nav" data-state="top">
  <div class="nav-inner">
    <a class="brand" href="#top" aria-label="Garden Design Solutions, Inc. — home">
      <img class="brand-logo" src="assets/logos/gdsi-logo.webp" width="1071" height="158" alt="Garden Design Solutions Incorporated" decoding="async">
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a href="#architecture">Architecture</a>
      <a href="#built">Built</a>
      <a href="#services">Services</a>
      <a href="#process">Process</a>
      <a href="#studio">Studio</a>
      <a href="#contact" class="nav-cta">Enquire</a>
    </nav>
    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mobileNav" aria-label="Open menu">
      <span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav" id="mobileNav" hidden>
    <a href="#architecture">Architecture</a>
    <a href="#built">Built</a>
    <a href="#services">Services</a>
    <a href="#process">Process</a>
    <a href="#studio">Studio</a>
    <a href="#contact">Enquire</a>
  </div>
</header>

<main id="main">
  <span id="top"></span>

  <!-- HERO -->
  <section class="hero" aria-label="Introduction">
    <div class="hero-media">
      <img src="assets/${HERO}" width="1448" height="1086"
           alt="A luxury estate and pool at twilight." fetchpriority="high" decoding="async">
      <div class="hero-scrim"></div>
    </div>
    <div class="hero-body">
      <p class="eyebrow eyebrow--light reveal">Residential Landscape Design &amp; Construction</p>
      <h1 class="hero-title reveal">Gardens that settle<br><em>into their surroundings.</em></h1>
      <p class="hero-lead reveal">Designing and building visually stunning, functional outdoor spaces along the Gulf Coast since 2002.</p>
      <div class="hero-actions reveal">
        <a class="btn btn--brass" href="#built">View the work</a>
        <a class="btn btn--ghost" href="#contact">Begin an enquiry</a>
      </div>
    </div>
    <a class="hero-scroll" href="#manifesto" aria-label="Scroll down">
      <span>Scroll</span><span class="hero-scroll-line" aria-hidden="true"></span>
    </a>
  </section>

  <!-- MANIFESTO -->
  <section class="manifesto section" id="manifesto" aria-label="Practice statement">
    <div class="container">
      <p class="eyebrow reveal">The practice</p>
      <p class="manifesto-lede reveal">We craft residential landscapes that feel <em>inevitable</em> — where planting, water, stone and light are resolved together, and the finished garden seems to have grown from the ground it stands on.</p>
    </div>
  </section>

  <!-- SERVICES -->
  <section class="services section" id="services" aria-labelledby="services-title">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Services</p>
        <h2 class="display" id="services-title">What we design &amp; build.</h2>
        <p class="section-lede">From a single planted courtyard to the grounds of an entire estate — a complete landscape practice under one roof.</p>
      </div>
      <div class="svc-grid">
${services}
      </div>
    </div>
  </section>

  <!-- LANDSCAPE ARCHITECTURE (plans) -->
  <section class="plans section" id="architecture" aria-labelledby="architecture-title">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Landscape architecture</p>
        <h2 class="display" id="architecture-title">Hand-rendered plans.</h2>
        <p class="section-lede">Named residential projects, drawn as measured design studies. Open any plan to view it full-screen and zoom into the detail.</p>
      </div>
      <div class="plan-grid">
${plans}
        <a class="plan plan--overview reveal" href="#built" data-jump-all>
          <span class="plan-body">
            <span class="plan-eyebrow">The finished work</span>
            <span class="plan-title">Built Environments</span>
            <span class="plan-meta">See our completed luxury outdoor spaces — pools, courtyards, gardens, lighting and estate entrances.</span>
            <span class="plan-cta">View built environments<span aria-hidden="true"> →</span></span>
          </span>
        </a>
      </div>
    </div>
  </section>

  <!-- DIVIDER -->
  <section class="divider divider--tall" aria-hidden="true">
    <div class="divider-media" data-parallax>
      <img src="assets/hero/hero-southern-estate-daylight.webp" width="1453" height="1083" alt="" loading="lazy" decoding="async">
    </div>
  </section>

  <!-- BUILT ENVIRONMENTS (completed spaces) -->
  <section class="portfolio section" id="built" aria-labelledby="built-title">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Built environments</p>
        <h2 class="display" id="built-title">Completed outdoor spaces.</h2>
        <p class="section-lede">A gallery of finished luxury landscapes, grouped by the spaces we build. Filter by type, or open any image to explore.</p>
      </div>
      <div class="chips" role="group" aria-label="Filter built environments by type">
          ${chips}
      </div>
      <div class="masonry" id="masonry">
${tiles}
      </div>
      <p class="masonry-empty" id="masonryEmpty" hidden>No work in this category yet.</p>
    </div>
  </section>

${beforeAfterSection()}
  <!-- PROCESS -->
  <section class="process section" id="process" aria-labelledby="process-title">
    <div class="container process-grid">
      <div class="process-intro reveal">
        <p class="eyebrow">Process</p>
        <h2 class="display" id="process-title">From first walk to full bloom.</h2>
        <p class="section-lede">Every project follows the same considered path — patient at the start, exacting through construction, and attentive long after planting.</p>
        <figure class="process-figure">
          <img src="assets/${TAYS}" width="994" height="1496" alt="A hand-rendered landscape design plan drawn from above." loading="lazy" decoding="async">
        </figure>
      </div>
      <ol class="steps">
${steps}
      </ol>
    </div>
  </section>

  <!-- DIVIDER -->
  <section class="divider" aria-hidden="true">
    <div class="divider-media" data-parallax>
      <img src="assets/hero/hero-luxury-landscape-pool-sunset.webp" width="1537" height="1023" alt="" loading="lazy" decoding="async">
    </div>
  </section>

  <!-- STUDIO / ABOUT -->
  <section class="studio section" id="studio" aria-labelledby="studio-title">
    <div class="container studio-grid">
      <figure class="studio-media reveal">
        <img src="assets/projects/planting-southern-home-live-oaks.webp" width="1455" height="1081" alt="A stately Southern home shaded by mature live oaks." loading="lazy" decoding="async">
      </figure>
      <div class="studio-body reveal">
        <p class="eyebrow">The studio</p>
        <h2 class="display" id="studio-title">Rooted on the Gulf Coast.</h2>
        <p class="studio-first">Operating in the Gulf Coast area since 2002, we at GDSI are experts in residential landscape design and construction. We pride ourselves on our ability to craft visually stunning and functional outdoor spaces that seamlessly blend into the natural surroundings.</p>
        <p>We work end to end — reading a site, drawing the plan, and building the landscape — so that planting, water, stone and light arrive as one considered whole.</p>
        <ul class="studio-stats">
          <li><span class="stat-k">Since 2002</span><span class="stat-v">Designing &amp; building</span></li>
          <li><span class="stat-k">Gulf Coast</span><span class="stat-v">Where we work</span></li>
          <li><span class="stat-k">Residential</span><span class="stat-v">Our focus</span></li>
        </ul>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section class="contact section" id="contact" aria-labelledby="contact-title">
    <div class="container contact-grid">
      <div class="contact-intro reveal">
        <p class="eyebrow">Enquiries</p>
        <h2 class="display" id="contact-title">Begin a garden.</h2>
        <p class="section-lede">Tell us about your property and what you would like it to become. We design and build residential landscapes across the Gulf Coast, and we read every enquiry personally.</p>
        <dl class="contact-facts">
          <div><dt>Practice</dt><dd>Garden Design Solutions, Inc.</dd></div>
          <div><dt>Since</dt><dd>2002</dd></div>
          <div><dt>Region</dt><dd>Gulf Coast</dd></div>
          <div><dt>Focus</dt><dd>Residential landscape design &amp; construction</dd></div>
        </dl>
      </div>

      <form name="gdsi-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="form reveal" action="/?sent=1">
        <input type="hidden" name="form-name" value="gdsi-contact">
        <p class="hp" hidden>
          <label>Do not fill this out if you are human: <input name="bot-field" tabindex="-1" autocomplete="off"></label>
        </p>
        <div class="field">
          <label for="f-name">Name <span aria-hidden="true">*</span></label>
          <input id="f-name" type="text" name="name" required autocomplete="name" placeholder="Your name">
        </div>
        <div class="field-row">
          <div class="field">
            <label for="f-email">Email <span aria-hidden="true">*</span></label>
            <input id="f-email" type="email" name="email" required autocomplete="email" placeholder="you@email.com">
          </div>
          <div class="field">
            <label for="f-phone">Phone</label>
            <input id="f-phone" type="tel" name="phone" autocomplete="tel" placeholder="Optional">
          </div>
        </div>
        <div class="field">
          <label for="f-interest">Area of interest</label>
          <select id="f-interest" name="interest">
            <option value="">— Select —</option>
            <option>Planting Design</option>
            <option>Water Features / Pools</option>
            <option>Lighting</option>
            <option>Hardscapes</option>
            <option>Landscape plan / rendering</option>
            <option>Full estate project</option>
          </select>
        </div>
        <div class="field">
          <label for="f-message">Tell us about your project <span aria-hidden="true">*</span></label>
          <textarea id="f-message" name="message" rows="5" required placeholder="Your property, your ideas, and what you'd like it to become."></textarea>
        </div>
        <button class="btn btn--brass btn--wide" type="submit">Send enquiry</button>
        <p class="form-note" id="formNote" role="status" hidden>Thank you — your enquiry has been sent. We'll be in touch.</p>
      </form>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <span class="brand-mark">GDSI</span>
      <p>Garden Design Solutions, Inc.<br>Residential landscape design &amp; construction · Gulf Coast · Since 2002</p>
    </div>
    <nav class="footer-links" aria-label="Footer">
      <a href="#architecture">Architecture</a>
      <a href="#built">Built</a>
      <a href="#services">Services</a>
      <a href="#process">Process</a>
      <a href="#studio">Studio</a>
      <a href="#contact">Enquire</a>
    </nav>
    <p class="footer-legal">© <span id="year">2026</span> Garden Design Solutions, Inc. All rights reserved.</p>
  </div>
</footer>

<!-- Lightbox with zoom -->
<div class="lightbox" id="lightbox" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Image viewer">
  <div class="lb-toolbar">
    <button class="lb-tool" id="lbZoomOut" type="button" aria-label="Zoom out">&minus;</button>
    <button class="lb-tool" id="lbZoomIn" type="button" aria-label="Zoom in">&plus;</button>
    <button class="lb-tool" id="lbFull" type="button" aria-label="Toggle full screen">⤢</button>
    <button class="lb-tool" id="lbClose" type="button" aria-label="Close viewer">&times;</button>
  </div>
  <button class="lb-nav lb-prev" id="lbPrev" type="button" aria-label="Previous image">&#8249;</button>
  <figure class="lb-figure" id="lbFigure">
    <img id="lbImg" src="" alt="" draggable="false">
  </figure>
  <button class="lb-nav lb-next" id="lbNext" type="button" aria-label="Next image">&#8250;</button>
  <figcaption class="lb-cap" id="lbCap"></figcaption>
  <p class="lb-hint" id="lbHint">Scroll or double-click to zoom · drag to pan</p>
</div>

<script src="assets/js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);

// Fresh manifest describing the production asset library.
const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  structure: { hero: 'assets/hero', projects: 'assets/projects', renderings: 'assets/renderings' },
  hero: ['hero-luxury-estate-pool-twilight.webp', 'hero-luxury-landscape-pool-sunset.webp', 'hero-southern-estate-daylight.webp'],
  projects: ITEMS.map(([cat, file, w, h, alt]) => ({ file: 'assets/projects/' + file, category: cat, width: w, height: h, alt })),
  renderings: PLANS.map(([file, w, h, title, meta, alt]) => ({ file: 'assets/' + file, project: title, location: meta, width: w, height: h, alt })),
};
fs.writeFileSync(path.join(REPO, 'assets/manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Wrote index.html (' + html.length + ' bytes)');
console.log('Portfolio tiles:', ITEMS.length, '| Plans:', PLANS.length, '| Services:', SERVICES.length);
