/* ==========================================================================
   GDSI shared build library — the single source of truth for site constants
   and responsive-image rendering, consumed by both the homepage generator
   (build-gdsi.js) and the reusable project-page generator (build-projects.js).
   No page-specific content lives here; keep this module presentation-neutral.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');

/* ---- Site-wide constants (verified facts only — never invent) ------------- */
const SITE = {
  origin: 'https://gdsi.netlify.app',
  name: 'Garden Design Solutions, Inc.',
  shortName: 'GDSI',
  founded: '2002',
  region: 'Gulf Coast',
  areaServed: ['Fairhope, Alabama', 'Mobile, Alabama', 'Gulf Breeze, Florida', 'Gulf Coast'],
  themeColor: '#24352A',
  // Contact channels render only when present (honest — no invented phone/email).
  // Populate `phone`/`email` here the moment the client verifies them.
  phone: null,
  email: null,
};
const abs = (p) => SITE.origin + '/' + String(p).replace(/^\//, '');

/* ---- Cache-busting content hashes for CSS/JS ------------------------------ */
const hashOf = (rel) => crypto.createHash('md5').update(fs.readFileSync(path.join(REPO, rel))).digest('hex').slice(0, 8);
const CSS_V = hashOf('assets/css/styles.css');
const JS_V = hashOf('assets/js/main.js');

/* ---- Responsive media manifest (AVIF + WebP srcset) ----------------------- */
let MEDIA = {};
try { MEDIA = JSON.parse(fs.readFileSync(path.join(REPO, 'assets/generated/media-manifest.json'), 'utf8')); }
catch (e) { console.warn('WARN: media-manifest.json missing — run "npm run media" first. Falling back to originals.'); }

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const srcset = (list) => list.map((s) => `${s.src} ${s.w}w`).join(', ');
const normKey = (s) => String(s).replace(/^assets\/originals\//, ''); // accept full path or bare key

// Emit a responsive <picture> (AVIF + WebP) from the manifest. `prefix` lets a
// sub-page (e.g. /projects/<slug>/) point back to root-relative asset URLs.
function picture(src, opts) {
  opts = opts || {};
  const pre = opts.prefix || '';
  const key = normKey(src);
  const sizes = opts.sizes || '100vw';
  const alt = esc(opts.alt || '');
  const cls = opts.imgClass ? ` class="${opts.imgClass}"` : '';
  const load = opts.eager ? '' : ' loading="lazy"';
  const fp = opts.eager ? ' fetchpriority="high"' : '';
  const style = opts.style ? ` style="${opts.style}"` : '';
  const m = MEDIA[key];
  if (!m) {
    return `<img src="${pre}assets/originals/${key}"${cls} alt="${alt}"${load} decoding="async"${fp}${style}>`;
  }
  const withPre = (list) => list.map((s) => ({ w: s.w, src: pre + s.src }));
  const dims = ` width="${m.width}" height="${m.height}"`;
  return `<picture>
            <source type="image/avif" srcset="${srcset(withPre(m.avif))}" sizes="${sizes}">
            <source type="image/webp" srcset="${srcset(withPre(m.webp))}" sizes="${sizes}">
            <img src="${pre}${m.fallback}"${dims}${cls} alt="${alt}"${load} decoding="async"${fp}${style}>
          </picture>`;
}

// Full-resolution master path (lightbox zoom target).
const master = (src, prefix) => `${prefix || ''}assets/originals/${normKey(src)}`;

// Hero <link rel=preload> with AVIF srcset (LCP).
function heroPreload(key, sizes, prefix) {
  const pre = prefix || '';
  const m = MEDIA[normKey(key)];
  if (!m) return `<link rel="preload" as="image" href="${pre}assets/originals/${normKey(key)}" fetchpriority="high">`;
  const withPre = m.avif.map((s) => ({ w: s.w, src: pre + s.src }));
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(withPre)}" imagesizes="${sizes}" fetchpriority="high">`;
}

// Absolute URL of a master image's best social-share derivative (for OG tags).
function socialImageAbs(src) {
  const m = MEDIA[normKey(src)];
  if (m && m.fallback) return abs(m.fallback);
  return abs('assets/originals/' + normKey(src));
}

/* ==========================================================================
   Shared page chrome — nav, footer, lightbox, <head>. Both the homepage and
   every /projects/<slug>/ page render from these, so the two can never drift.
   `home` is the path back to the site root: '' on the homepage, '/' on a
   project page. `assetPrefix` prefixes asset URLs the same way.
   ========================================================================== */
const NAV_ITEMS = [
  ['#architecture', 'Architecture'],
  ['#built', 'Built'],
  ['#services', 'Services'],
  ['#process', 'Process'],
  ['#studio', 'Studio'],
];

function headTags(o) {
  // o: { title, description, canonical, ogType, ogImage, prefix }
  const pre = o.prefix || '';
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.description)}">
  <meta name="theme-color" content="${SITE.themeColor}">
  <link rel="canonical" href="${o.canonical}">
  <meta property="og:type" content="${o.ogType || 'website'}">
  <meta property="og:title" content="${esc(o.ogTitle || o.title)}">
  <meta property="og:description" content="${esc(o.description)}">
  <meta property="og:image" content="${o.ogImage}">
  <meta property="og:url" content="${o.canonical}">
  <meta property="og:site_name" content="${esc(SITE.name)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(o.ogTitle || o.title)}">
  <meta name="twitter:description" content="${esc(o.description)}">
  <meta name="twitter:image" content="${o.ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${o.preload || ''}
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${pre}assets/css/styles.css?v=${CSS_V}">`;
}

function navHTML(home, assetPrefix) {
  const links = NAV_ITEMS.map(([h, l]) => `      <a href="${home}${h}">${l}</a>`).join('\n');
  const mlinks = NAV_ITEMS.map(([h, l]) => `    <a href="${home}${h}">${l}</a>`).join('\n');
  return `<header class="nav" id="nav" data-state="top">
  <div class="nav-inner">
    <a class="brand" href="${home || '#top'}" aria-label="${esc(SITE.name)} — home">
      <img class="brand-logo" src="${assetPrefix}assets/logos/gdsi-logo.webp" width="1071" height="158" alt="Garden Design Solutions Incorporated" decoding="async">
    </a>
    <nav class="nav-links" aria-label="Primary">
${links}
      <a href="${home}#contact" class="nav-cta">Enquire</a>
    </nav>
    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mobileNav" aria-label="Open menu">
      <span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav" id="mobileNav" hidden>
${mlinks}
    <a href="${home}#contact">Enquire</a>
  </div>
</header>`;
}

function footerHTML(home) {
  const links = NAV_ITEMS.concat([['#contact', 'Enquire']])
    .map(([h, l]) => `      <a href="${home}${h}">${l}</a>`).join('\n');
  return `<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <span class="brand-mark">GDSI</span>
      <p>${esc(SITE.name)}<br>Residential landscape design &amp; construction · ${SITE.region} · Since ${SITE.founded}</p>
    </div>
    <nav class="footer-links" aria-label="Footer">
${links}
    </nav>
    <p class="footer-legal">© <span id="year">2026</span> ${esc(SITE.name)} All rights reserved.</p>
  </div>
</footer>`;
}

const LIGHTBOX_HTML = `<!-- Lightbox with zoom -->
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
</div>`;

const jsonld = (obj) => `  <script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n  </script>`;

module.exports = {
  REPO, SITE, abs, hashOf, CSS_V, JS_V, MEDIA,
  esc, srcset, normKey, picture, master, heroPreload, socialImageAbs,
  NAV_ITEMS, headTags, navHTML, footerHTML, LIGHTBOX_HTML, jsonld,
};
