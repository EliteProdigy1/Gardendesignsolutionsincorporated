/* Generates sitemap.xml from the site's real, published URLs: the homepage plus
   every enabled project page. Keeping this derived means publishing a project
   updates the sitemap automatically — no hand-maintained URL list. */
const fs = require('fs');
const path = require('path');
const { REPO, abs } = require('./lib.js');

function writeSitemap(projectPages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [{ loc: abs(''), priority: '1.0', changefreq: 'monthly', lastmod: today }]
    .concat((projectPages || []).map((p) => ({ loc: p.loc, priority: '0.8', changefreq: 'yearly', lastmod: p.lastmod })));
  const body = urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(REPO, 'sitemap.xml'), xml);
  return urls.length;
}

module.exports = { writeSitemap };
