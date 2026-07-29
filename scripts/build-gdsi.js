/* GDSI static site generator — emits index.html, /projects/<slug>/index.html,
   sitemap.xml and assets/manifest.json. Run with: node scripts/build-gdsi.js
   Shared rendering + site constants live in scripts/lib.js; the project engine
   lives in scripts/projects.js; project pages in scripts/build-projects.js. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { getFeatured, getEnabled } = require('./projects.js');
const { buildProjectPages, projectCard } = require('./build-projects.js');
const { writeSitemap } = require('./build-sitemap.js');

const {
  REPO, SITE, abs, CSS_V, JS_V, esc, picture, master, heroPreload, socialImageAbs,
  headTags, navHTML, footerHTML, LIGHTBOX_HTML, jsonld,
} = L;
const OUT = path.join(REPO, 'index.html');

// Built Environments categories — completed spaces, grouped by what they are.
const CATS = [
  { key: 'pools',      label: 'Pools' },
  { key: 'courtyards', label: 'Courtyards' },
  { key: 'gardens',    label: 'Gardens' },
  { key: 'lighting',   label: 'Lighting' },
  { key: 'entrances',  label: 'Estate Entrances' },
];

// Built Environments items: [category, file(under assets/originals/gallery), w, h, alt]
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

const labelFor = (k) => CATS.find((c) => c.key === k).label;

// Map a plan master file → its flagship project slug, so the "Hand-rendered
// plans" cards route to the full case study (whose hero is the zoomable plan)
// instead of duplicating it in a lightbox.
const stripOrig = (s) => String(s).replace(/^assets\/originals\//, '');
const PLAN_TO_SLUG = {};
getEnabled().forEach((p) => { if (p.media.plan) PLAN_TO_SLUG[stripOrig(p.media.plan.src)] = p.slug; });

function figure(it) {
  const [cat, file, w, h, alt] = it;
  const key = 'gallery/' + file;
  return `        <figure class="tile reveal" data-cat="${cat}" style="aspect-ratio:${w}/${h}">
          <button class="tile-btn" type="button" data-group="built" data-full="${master(key)}" data-alt="${esc(alt)}" data-caption="${labelFor(cat)}" aria-label="View larger: ${esc(alt)}">
            ${picture(key, { alt, sizes: '(min-width:900px) 31vw, (min-width:560px) 46vw, 92vw' })}
            <span class="tile-meta"><span class="tile-cat">${labelFor(cat)}</span></span>
          </button>
        </figure>`;
}

function planCard(p) {
  const [file, w, h, title, meta, alt] = p;
  const slug = PLAN_TO_SLUG[stripOrig(file)];
  const img = `<span class="plan-img">${picture(file, { alt, sizes: '(min-width:900px) 30vw, 45vw' })}</span>`;
  if (slug) {
    // Links to the flagship project page (which leads with the zoomable plan).
    return `        <a class="plan reveal" href="projects/${slug}/" aria-label="View project: ${esc(title)}, ${esc(meta)}">
          ${img}
          <span class="plan-body">
            <span class="plan-title">${esc(title)}</span>
            <span class="plan-meta">${esc(meta)}</span>
            <span class="plan-cta">View project<span aria-hidden="true"> →</span></span>
          </span>
        </a>`;
  }
  return `        <button class="plan reveal" type="button" data-group="plans" data-full="${master(file)}" data-alt="${esc(alt)}" data-caption="${esc(title)} — ${esc(meta)}" aria-label="Open plan: ${esc(title)}, ${esc(meta)}">
          ${img}
          <span class="plan-body">
            <span class="plan-title">${esc(title)}</span>
            <span class="plan-meta">${esc(meta)}</span>
            <span class="plan-cta">View plan<span aria-hidden="true"> ⤢</span></span>
          </span>
        </button>`;
}

// Services (five disciplines + full estate). [jump, filterKey|'', image, title, copy]
const SERVICES = [
  ['#built', 'gardens', 'gallery/planting-coastal-hydrangea-garden-path.webp', 'Planting Design', 'Seasonal structure, native and coastal palettes, and living architecture composed to settle into its site.'],
  ['#built', 'pools', 'gallery/water-luxury-pool-courtyard.webp', 'Water Features & Pools', 'Pools, spas, fountains and reflecting water composed as the quiet centre of an outdoor room.'],
  ['#built', 'lighting', 'gallery/lighting-courtyard-uplighting-dusk.webp', 'Lighting', 'Layered exterior lighting that lets a garden change character from dusk into full night.'],
  ['#built', 'courtyards', 'gallery/hardscape-white-brick-courtyard.webp', 'Hardscapes', 'Terraces, courtyards, walls and gateways in brick and stone that give a landscape its bones.'],
  ['#architecture', '', 'renderings/tays-memorial-garden-plan-mobile-al.webp', 'Landscape Architecture', 'Measured, hand-rendered plans that let a whole property be understood before a spade is lifted.'],
  ['#built', '', 'gallery/estate-pool-golden-hour.webp', 'Full Estate Landscapes', 'Whole-property design and construction carried from the first drawing to the finished ground.'],
];

function serviceCard(s, i) {
  const [jump, filter, file, title, copy] = s;
  const n = String(i + 1).padStart(2, '0');
  const attr = filter ? ` data-jump="${filter}"` : '';
  return `        <a class="svc reveal" href="${jump}"${attr}>
          <span class="svc-img">${picture(file, { alt: '', sizes: '(min-width:900px) 30vw, 45vw' })}</span>
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

// Featured / selected projects rail — data-driven, hidden until a project is
// enabled. Cards link to the canonical /projects/<slug>/ page (single source).
function featuredSection() {
  // Plan-study projects live in the "Landscape architecture" section (their
  // cards link straight to the project pages), so this rail carries only
  // photographed built projects — hidden until one exists.
  const built = (arr) => arr.filter((p) => p.kind !== 'plan-study');
  const feat = built(getFeatured());
  const list = feat.length ? feat : built(getEnabled());
  if (!list.length) return '';
  return `
  <!-- SELECTED PROJECTS — derived from the project engine (hidden until enabled) -->
  <section class="projects section" id="projects" aria-labelledby="projects-title">
    <div class="container">
      <div class="section-head reveal">
        <p class="eyebrow">Selected projects</p>
        <h2 class="display" id="projects-title">From concept to completion.</h2>
        <p class="section-lede">Individual estates, told in full — from the plan and the ground it stood on to the finished, planted and illuminated landscape.</p>
      </div>
      <div class="pcard-grid">
${list.map((p) => projectCard(p, '')).join('\n')}
      </div>
    </div>
  </section>
`;
}

// Contact channels render only when verified (no invented phone/email).
function contactChannels() {
  const rows = [];
  if (SITE.phone) rows.push(`<div><dt>Telephone</dt><dd><a href="tel:${SITE.phone.replace(/[^+\d]/g, '')}">${esc(SITE.phone)}</a></dd></div>`);
  if (SITE.email) rows.push(`<div><dt>Email</dt><dd><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></dd></div>`);
  return rows.join('\n          ');
}

const chips = [`<button class="chip is-active" type="button" data-filter="all" aria-pressed="true">All work</button>`]
  .concat(CATS.map((c) => `<button class="chip" type="button" data-filter="${c.key}" aria-pressed="false">${c.label}</button>`))
  .join('\n          ');

const tiles = ITEMS.map(figure).join('\n');
const plans = PLANS.map(planCard).join('\n');
const services = SERVICES.map(serviceCard).join('\n');
const steps = PROCESS.map(processStep).join('\n');

const HERO = 'hero/hero-luxury-estate-pool-twilight.webp';

// Homepage structured data — Organization + ProfessionalService + WebSite graph.
const postalAddress = SITE.address ? {
  '@type': 'PostalAddress',
  streetAddress: SITE.address.street,
  addressLocality: SITE.address.city,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.country,
} : undefined;

const service = {
  '@type': ['ProfessionalService', 'LocalBusiness'],
  '@id': abs('#service'),
  name: SITE.name,
  alternateName: SITE.shortName,
  description: 'Residential landscape design and construction along the Gulf Coast since 2002.',
  url: abs(''),
  image: socialImageAbs(HERO),
  areaServed: SITE.areaServed,
  foundingDate: SITE.founded,
  parentOrganization: { '@id': abs('#organization') },
  knowsAbout: ['Planting Design', 'Water Features', 'Pools', 'Landscape Lighting', 'Hardscapes', 'Landscape Architecture'],
};
if (postalAddress) service.address = postalAddress;
if (SITE.phone) service.telephone = SITE.phone;
if (SITE.email) service.email = SITE.email;

const organization = {
  '@type': 'Organization',
  '@id': abs('#organization'),
  name: SITE.name,
  alternateName: SITE.shortName,
  url: abs(''),
  logo: abs('assets/logos/gdsi-logo.webp'),
  foundingDate: SITE.founded,
  areaServed: SITE.areaServed,
};
if (postalAddress) organization.address = postalAddress;

const homepageJsonLd = jsonld({
  '@context': 'https://schema.org',
  '@graph': [
    organization,
    service,
    {
      '@type': 'WebSite',
      '@id': abs('#website'),
      name: SITE.name,
      url: abs(''),
      publisher: { '@id': abs('#organization') },
    },
  ],
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
${headTags({
  title: 'Garden Design Solutions, Inc. — Residential Landscape Design & Construction',
  description: 'Garden Design Solutions, Inc. (GDSI) has designed and built residential landscapes along the Gulf Coast since 2002 — planting design, pools and water features, lighting, hardscapes and hand-rendered landscape plans.',
  canonical: abs(''),
  ogType: 'website',
  ogTitle: 'Garden Design Solutions, Inc.',
  ogImage: socialImageAbs(HERO),
  preload: heroPreload(HERO, '100vw'),
})}
${homepageJsonLd}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
${navHTML('', '')}

<main id="main">
  <span id="top"></span>

  <!-- HERO -->
  <section class="hero" aria-label="Introduction">
    <div class="hero-media">
      ${picture(HERO, { alt: 'A luxury estate and pool at twilight.', eager: true, sizes: '100vw' })}
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
        <p class="section-lede">Named residential projects, drawn as measured design studies. Open any project to explore the full plan and zoom into the detail.</p>
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
      ${picture('hero/hero-southern-estate-daylight.webp', { alt: '', sizes: '100vw' })}
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
${featuredSection()}
  <!-- PROCESS -->
  <section class="process section" id="process" aria-labelledby="process-title">
    <div class="container process-grid">
      <div class="process-intro reveal">
        <p class="eyebrow">Process</p>
        <h2 class="display" id="process-title">From first walk to full bloom.</h2>
        <p class="section-lede">Every project follows the same considered path — patient at the start, exacting through construction, and attentive long after planting.</p>
        <figure class="process-figure">
          ${picture(TAYS, { alt: 'A hand-rendered landscape design plan drawn from above.', sizes: '(min-width:900px) 40vw, 92vw' })}
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
      ${picture('hero/hero-luxury-landscape-pool-sunset.webp', { alt: '', sizes: '100vw' })}
    </div>
  </section>

  <!-- STUDIO / ABOUT -->
  <section class="studio section" id="studio" aria-labelledby="studio-title">
    <div class="container studio-grid">
      <figure class="studio-media reveal">
        ${picture('gallery/planting-southern-home-live-oaks.webp', { alt: 'A stately Southern home shaded by mature live oaks.', sizes: '(min-width:820px) 48vw, 92vw' })}
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
          ${contactChannels()}
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

${footerHTML('')}

${LIGHTBOX_HTML}

<script src="assets/js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);

// Reusable project pages + derived sitemap.
const projectPages = buildProjectPages();
const sitemapCount = writeSitemap(projectPages);

// Fresh manifest describing the production asset library.
const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  structure: {
    masters: 'assets/originals/{hero,gallery,renderings,projects/<slug>/...}',
    derivatives: 'assets/generated/{avif,webp,thumbnails}/… (see media-manifest.json)',
    pipeline: 'scripts/media-pipeline.js',
    projectEngine: 'scripts/projects.js → /projects/<slug>/ via scripts/build-projects.js',
  },
  hero: ['hero-luxury-estate-pool-twilight.webp', 'hero-luxury-landscape-pool-sunset.webp', 'hero-southern-estate-daylight.webp'],
  gallery: ITEMS.map(([cat, file, w, h, alt]) => ({ master: 'assets/originals/gallery/' + file, category: cat, width: w, height: h, alt })),
  renderings: PLANS.map(([file, w, h, title, meta, alt]) => ({ master: 'assets/originals/' + file, project: title, location: meta, width: w, height: h, alt })),
};
fs.writeFileSync(path.join(REPO, 'assets/manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Wrote index.html (' + html.length + ' bytes)');
console.log('Portfolio tiles:', ITEMS.length, '| Plans:', PLANS.length, '| Services:', SERVICES.length);
console.log('Project pages:', projectPages.length, projectPages.map((p) => p.url).join(', ') || '(none — all disabled)');
console.log('Sitemap URLs:', sitemapCount);
