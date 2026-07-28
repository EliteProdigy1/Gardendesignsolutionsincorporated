/* ==========================================================================
   GDSI reusable project-page generator.
   For every ENABLED project it writes  projects/<slug>/index.html  — a luxury
   architecture case study rendered entirely from the project record. No
   handwritten HTML per project; drop media + fill the record + enable = a page.

   Returns [{ slug, url, loc, lastmod }] for the sitemap. Writes nothing (and
   removes stale output) when a project is disabled, so concept work never
   leaks a public URL.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { getEnabled, relatedTo } = require('./projects.js');

const { REPO, SITE, abs, esc, picture, master, heroPreload, socialImageAbs,
  headTags, navHTML, footerHTML, LIGHTBOX_HTML, jsonld, JS_V } = L;

const PRE = '/';           // project pages sit two levels deep → root-absolute assets
const HOME = '/';          // nav/footer links resolve to the site root
const CAT_LABEL = { pools: 'Pools', courtyards: 'Courtyards', gardens: 'Gardens', lighting: 'Lighting', entrances: 'Estate Entrances' };

/* ---- Small render helpers ------------------------------------------------- */
const metaLine = (p) => [p.city, p.completionYear].filter(Boolean).join(' · ');

// Pick the most representative image for hero / social, honouring explicit hero.
function leadImage(p) {
  if (p.media.hero) return p.media.hero;
  const pools = [].concat(p.media.completed, p.media.after, p.media.twilight, p.media.drone);
  if (pools.length) return pools[0];
  if (p.comparisons.length) return p.comparisons[0].after;
  if (p.media.plan) return p.media.plan;
  return null;
}

function tile(item, group, caption, sizes) {
  return `          <button class="cs-tile" type="button" data-group="${group}" data-full="${master(item.src, PRE)}" data-alt="${esc(item.alt || '')}" data-caption="${esc(caption || '')}" aria-label="View larger: ${esc(item.alt || caption || '')}">
            ${picture(item.src, { alt: item.alt, sizes: sizes || '(min-width:900px) 30vw, 90vw', prefix: PRE })}
          </button>`;
}

function subhead(eyebrow) { return `        <div class="cs-subhead"><span class="cs-eyebrow">${esc(eyebrow)}</span></div>`; }

/* ---- Narrative blocks (Challenge / Vision / Process / Craft / Outcome) ----- */
function narrative(p) {
  const parts = [
    ['The challenge', p.challenge],
    ['The vision', p.vision],
    ['The process', p.process],
    ['The craft', p.craft],
    ['The outcome', p.outcome],
  ].filter(([, v]) => v);
  if (!parts.length) return '';
  return `    <section class="section pnar-section" aria-label="Project narrative">
      <div class="container pnar-list">
${parts.map(([k, v], i) => `        <div class="pnar reveal">
          <p class="eyebrow">${esc(k)}</p>
          <p class="pnar-copy">${esc(v)}</p>
        </div>`).join('\n')}
      </div>
    </section>`;
}

function planBlock(p, group) {
  const m = p.media.plan;
  if (!m) return '';
  const pdf = p.media.pdf ? `\n          <a class="btn btn--brass btn--sm" href="${PRE}${String(p.media.pdf).replace(/^\//, '')}" download>Download plan (PDF)</a>` : '';
  return `    <section class="section cs-section" aria-label="Landscape plan">
      <div class="container">
${subhead('Landscape plan')}
        <div class="cs-plan reveal" data-plan-viewer>
          <button class="cs-plan-img cs-tile" type="button" data-group="${group}" data-full="${master(m.src, PRE)}" data-alt="${esc(m.alt || '')}" data-caption="Landscape plan — ${esc(p.name)}" aria-label="View the landscape plan full-screen">
            ${picture(m.src, { alt: m.alt || 'Landscape plan', sizes: '(min-width:900px) 60vw, 92vw', prefix: PRE })}
          </button>${pdf}
        </div>
      </div>
    </section>`;
}

function timelineBlock(p, group) {
  if (!p.media.during.length) return '';
  const steps = p.media.during.map((it, i) => `            <li class="cs-step">
              <button class="cs-tile" type="button" data-group="${group}" data-full="${master(it.src, PRE)}" data-alt="${esc(it.alt || '')}" data-caption="Construction — ${esc(p.name)}" aria-label="View larger: ${esc(it.alt || 'construction')}">
                ${picture(it.src, { alt: it.alt, sizes: '(min-width:900px) 31vw, 80vw', prefix: PRE })}
              </button>
              <span class="cs-step-n">${String(i + 1).padStart(2, '0')}</span>
            </li>`).join('\n');
  return `    <section class="section cs-section" aria-label="Construction timeline">
      <div class="container">
${subhead('Construction timeline')}
        <ol class="cs-timeline reveal">
${steps}
        </ol>
      </div>
    </section>`;
}

function galleryBlock(eyebrow, items, p, group, aria) {
  if (!items.length) return '';
  return `    <section class="section cs-section" aria-label="${aria}">
      <div class="container">
${subhead(eyebrow)}
        <div class="cs-gallery reveal">
${items.map((it) => tile(it, group, eyebrow + ' — ' + p.name, '(min-width:900px) 22vw, 45vw')).join('\n')}
        </div>
      </div>
    </section>`;
}

function comparisonBlock(p) {
  if (!p.comparisons.length) return '';
  const sz = '(min-width:900px) 46vw, 92vw';
  const figs = p.comparisons.map((c, i) => `          <figure class="ba reveal">
            <div class="ba-frame" data-ba style="--pos:50%">
              ${picture(c.after.src, { alt: c.after.alt, imgClass: 'ba-img ba-after', sizes: sz, prefix: PRE })}
              ${picture(c.before.src, { alt: c.before.alt, imgClass: 'ba-img ba-before', sizes: sz, prefix: PRE })}
              <span class="ba-label ba-label--before" aria-hidden="true">Before</span>
              <span class="ba-label ba-label--after" aria-hidden="true">After</span>
              <span class="ba-divider" aria-hidden="true"></span>
              <button class="ba-handle" type="button" role="slider" aria-label="Reveal before or after — ${esc(p.name + ' — ' + c.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
                <span aria-hidden="true">&#8249;&#8250;</span>
              </button>
            </div>
            ${c.label ? `<figcaption class="ba-cap"><span class="ba-cat">${esc(c.label)}</span></figcaption>` : ''}
          </figure>`).join('\n');
  const disc = (p.status === 'concept' && p.disclosure) ? `\n        <p class="ba-disclosure">${esc(p.disclosure)}</p>` : '';
  return `    <section class="section cs-section" aria-label="Before, during and after">
      <div class="container">
${subhead('Before · During · After')}
        <div class="ba-grid reveal">
${figs}
        </div>${disc}
      </div>
    </section>`;
}

function specsBlock(p) {
  const rows = [];
  if (p.plantPalette.length) rows.push(['Plant palette', p.plantPalette.join(', ')]);
  if (p.hardscapeMaterials.length) rows.push(['Hardscape materials', p.hardscapeMaterials.join(', ')]);
  if (p.lightingSystem) rows.push(['Lighting', p.lightingSystem]);
  if (p.irrigation) rows.push(['Irrigation', p.irrigation]);
  if (p.specialFeatures.length) rows.push(['Special features', p.specialFeatures.join(', ')]);
  if (!rows.length) return '';
  return `    <section class="section cs-section" aria-label="Project specifications">
      <div class="container">
${subhead('Materials & planting')}
        <dl class="cs-specs reveal">
${rows.map(([k, v]) => `          <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>`;
}

function creditsBlock(p) {
  const rows = [
    ['Design', p.designer], ['Landscape architect', p.architect],
    ['Construction', p.builder], ['Photography', p.photographer],
  ].filter(([, v]) => v);
  if (!rows.length) return '';
  return `        <dl class="pcredits">
${rows.map(([k, v]) => `          <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
        </dl>`;
}

function testimonialBlock(p) {
  if (!p.testimonials.length) return '';
  const t = p.testimonials[0];
  return `    <section class="section ptestimonial" aria-label="Client testimonial">
      <div class="container reveal">
        <blockquote class="pquote">
          <p>${esc(t.quote)}</p>
          ${t.attribution ? `<cite>${esc(t.attribution)}</cite>` : ''}
        </blockquote>
      </div>
    </section>`;
}

function awardsBlock(p) {
  if (!p.awards.length) return '';
  return `    <section class="section cs-section" aria-label="Awards and press">
      <div class="container">
${subhead('Awards & press')}
        <ul class="pawards reveal">
${p.awards.map((a) => `          <li><span class="pawards-t">${esc(a.title)}</span>${a.source ? `<span class="pawards-s">${esc(a.source)}${a.year ? ' · ' + a.year : ''}</span>` : ''}</li>`).join('\n')}
        </ul>
      </div>
    </section>`;
}

/* ---- Project card (shared with the homepage featured rail) ---------------- */
function projectCard(p, home) {
  const lead = leadImage(p);
  const href = `${home || ''}projects/${p.slug}/`;
  const img = lead
    ? picture(lead.src, { alt: lead.alt || p.name, sizes: '(min-width:900px) 32vw, 92vw', prefix: home || '' })
    : '';
  const meta = metaLine(p);
  return `        <a class="pcard reveal" href="${href}">
          <span class="pcard-img">${img}</span>
          <span class="pcard-body">
            ${p.featured ? '<span class="pcard-flag">Featured</span>' : ''}
            <span class="pcard-title">${esc(p.name)}</span>
            ${meta ? `<span class="pcard-meta">${esc(meta)}</span>` : ''}
            <span class="pcard-cta">View project<span aria-hidden="true"> →</span></span>
          </span>
        </a>`;
}

function relatedBlock(p) {
  const rel = relatedTo(p, 3);
  if (!rel.length) return '';
  return `    <section class="section prelated" aria-labelledby="prel-${p.slug}">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">More work</p>
          <h2 class="display" id="prel-${p.slug}">Related projects.</h2>
        </div>
        <div class="pcard-grid">
${rel.map((r) => projectCard(r, HOME)).join('\n')}
        </div>
      </div>
    </section>`;
}

const ctaBlock = () => `    <section class="section pcta" aria-labelledby="pcta-t">
      <div class="container reveal">
        <p class="eyebrow">Enquiries</p>
        <h2 class="display" id="pcta-t">Begin a garden of your own.</h2>
        <p class="section-lede">We design and build residential landscapes across the ${esc(SITE.region)}. Tell us about your property and what you would like it to become.</p>
        <a class="btn btn--brass" href="${HOME}#contact">Begin an enquiry</a>
      </div>
    </section>`;

/* ---- Structured data (per project page) ----------------------------------- */
function structuredData(p, canonical, lead) {
  const images = [];
  const add = (it) => { if (it && it.src) images.push(socialImageAbs(it.src)); };
  add(lead);
  p.media.completed.concat(p.media.after, p.media.twilight, p.media.details).forEach(add);
  const creative = {
    '@context': 'https://schema.org', '@type': 'CreativeWork',
    name: p.name, creator: { '@type': 'Organization', name: SITE.name, url: abs('') },
    about: 'Residential landscape design and construction',
    url: canonical,
    image: images.slice(0, 8),
  };
  if (p.city) creative.locationCreated = { '@type': 'Place', name: p.city };
  if (p.completionYear) creative.dateCreated = String(p.completionYear);
  if (p.intro || p.story) creative.description = p.intro || p.story;
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: abs('') },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: abs('#built') },
      { '@type': 'ListItem', position: 3, name: p.name, item: canonical },
    ],
  };
  return jsonld(creative) + '\n' + jsonld(crumbs);
}

/* ---- Full project page ---------------------------------------------------- */
function renderPage(p) {
  const canonical = abs(`projects/${p.slug}/`);
  const lead = leadImage(p);
  const group = 'proj-' + p.slug;
  const title = p.seo.title || `${p.name} — ${SITE.name}`;
  const descBase = p.seo.description || p.intro || p.story ||
    `${p.name}${p.city ? ' in ' + p.city : ''} — a residential landscape ${p.status === 'verified' ? 'designed and built' : 'design study'} by ${SITE.name}.`;
  const ogImage = p.seo.socialImage ? socialImageAbs(p.seo.socialImage) : (lead ? socialImageAbs(lead.src) : abs('assets/originals/hero/hero-luxury-estate-pool-twilight.webp'));
  const preload = lead ? heroPreload(lead.src, '100vw', PRE) : '';

  const services = p.services.length
    ? `<ul class="project-services">${p.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '';
  const cats = p.categories.length
    ? `<p class="pcats">${p.categories.map((c) => esc(CAT_LABEL[c] || c)).join(' · ')}</p>` : '';
  const intro = p.intro ? `<p class="project-story">${esc(p.intro)}</p>` : (p.story ? `<p class="project-story">${esc(p.story)}</p>` : '');
  const disc = (p.status === 'concept' && p.disclosure) ? `<p class="ba-disclosure ba-disclosure--top">${esc(p.disclosure)}</p>` : '';

  const heroMedia = lead
    ? `<div class="phero-media">${picture(lead.src, { alt: lead.alt || p.name, eager: true, sizes: '100vw', prefix: PRE })}<div class="hero-scrim"></div></div>`
    : '';

  const body = `<main id="main">
    <span id="top"></span>

    <section class="phero" aria-label="${esc(p.name)}">
      ${heroMedia}
      <div class="phero-body">
        <nav class="pcrumb" aria-label="Breadcrumb">
          <a href="${HOME}">Home</a> <span aria-hidden="true">/</span>
          <a href="${HOME}#built">Projects</a> <span aria-hidden="true">/</span>
          <span aria-current="page">${esc(p.name)}</span>
        </nav>
        ${p.featured ? '<p class="eyebrow eyebrow--light reveal">Featured project</p>' : ''}
        <h1 class="phero-title reveal">${esc(p.name)}</h1>
        ${metaLine(p) ? `<p class="phero-meta reveal">${esc(metaLine(p))}</p>` : ''}
      </div>
    </section>

    <section class="section pintro" aria-label="Project introduction">
      <div class="container pintro-grid">
        <div class="pintro-main reveal">
          ${cats}
          ${intro}
          ${disc}
        </div>
        <div class="pintro-side reveal">
          ${services}
${creditsBlock(p)}
        </div>
      </div>
    </section>
${[
    narrative(p),
    planBlock(p, group),
    timelineBlock(p, group),
    galleryBlock('Completed', p.media.completed, p, group, 'Completed project'),
    comparisonBlock(p),
    specsBlock(p),
    galleryBlock('Twilight', p.media.twilight, p, group, 'Twilight photography'),
    galleryBlock('Aerial', p.media.drone, p, group, 'Aerial photography'),
    galleryBlock('Details', p.media.details, p, group, 'Detail photography'),
    testimonialBlock(p),
    awardsBlock(p),
    relatedBlock(p),
    ctaBlock(),
  ].filter(Boolean).join('\n')}
  </main>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
${headTags({ title, description: descBase, canonical, ogType: 'article', ogImage, preload, prefix: PRE })}
${structuredData(p, canonical, lead)}
</head>
<body class="page-project">
<a class="skip-link" href="#main">Skip to content</a>
<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
${navHTML(HOME, PRE)}
${body}
${footerHTML(HOME)}
${LIGHTBOX_HTML}
<script src="${PRE}assets/js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;
}

/* ---- Orchestration -------------------------------------------------------- */
function buildProjectPages() {
  const enabled = getEnabled();
  const outDir = path.join(REPO, 'projects');
  const written = [];
  const today = new Date().toISOString().slice(0, 10);

  enabled.forEach((p) => {
    const dir = path.join(outDir, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderPage(p));
    written.push({ slug: p.slug, url: `projects/${p.slug}/`, loc: abs(`projects/${p.slug}/`), lastmod: today });
  });

  // Remove stale pages for slugs that are no longer enabled (keeps the tree
  // honest — a disabled/concept project never leaves a public page behind).
  if (fs.existsSync(outDir)) {
    const keep = new Set(enabled.map((p) => p.slug));
    for (const name of fs.readdirSync(outDir)) {
      const full = path.join(outDir, name);
      if (fs.statSync(full).isDirectory() && !keep.has(name)) {
        fs.rmSync(full, { recursive: true, force: true });
      }
    }
    if (!fs.readdirSync(outDir).length) fs.rmdirSync(outDir);
  }
  return written;
}

module.exports = { buildProjectPages, projectCard, leadImage, renderPage };
