#!/usr/bin/env node
/* ==========================================================================
   GDSI PRODUCTION MEDIA PIPELINE
   --------------------------------------------------------------------------
   Turns every master image in  assets/originals/**  into responsive,
   next-gen derivatives and a manifest the site generator consumes.

   Workflow (future-proof):
     1. Drop a high-resolution master into  assets/originals/<path>/<name>.<ext>
     2. Run:  node scripts/media-pipeline.js
     3. It generates AVIF + WebP at multiple widths (never upscaling),
        a tiny blur-up thumbnail, and updates the manifest.
     4. Masters are never modified. Re-runs are idempotent (skip existing).

   Output:
     assets/generated/avif/<path>/<name>-<w>.avif
     assets/generated/webp/<path>/<name>-<w>.webp
     assets/generated/thumbnails/<path>/<name>.webp     (32px blur-up)
     assets/generated/media-manifest.json               (path -> sources)

   The site never hard-codes a size — it emits <picture> with AVIF + WebP
   srcset from the manifest, so browsers download the smallest sufficient file.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const REPO = path.resolve(__dirname, '..');
const ORIG = path.join(REPO, 'assets/originals');
const GEN = path.join(REPO, 'assets/generated');
const MANIFEST = path.join(GEN, 'media-manifest.json');

const SIZES = [480, 768, 1200, 1800, 2400, 3200];
const AVIF = { quality: 50, effort: 3 };
const WEBP = { quality: 80 };
const THUMB_W = 32;
const EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png']);

function walk(dir) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (EXTS.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}
const ensure = (p) => fs.mkdirSync(path.dirname(p), { recursive: true });
const rel = (abs) => path.relative(ORIG, abs).split(path.sep).join('/'); // posix key

async function run() {
  const files = walk(ORIG);
  const manifest = {};
  let made = 0, skipped = 0;
  for (const abs of files) {
    const key = rel(abs);                       // e.g. gallery/water-....webp
    const dir = path.dirname(key);
    const name = path.basename(key, path.extname(key));
    const input = sharp(abs, { failOn: 'none' });
    const meta = await input.metadata();
    const width = meta.width, height = meta.height;

    // target widths: every listed size below native, plus native (no upscaling)
    let targets = SIZES.filter((s) => s < width);
    targets.push(width);
    targets = [...new Set(targets)].sort((a, b) => a - b);

    const webpSet = [], avifSet = [];
    for (const w of targets) {
      const wOut = path.join(GEN, 'webp', dir, `${name}-${w}.webp`);
      const aOut = path.join(GEN, 'avif', dir, `${name}-${w}.avif`);
      ensure(wOut); ensure(aOut);
      if (fs.existsSync(wOut)) { skipped++; } else {
        await sharp(abs).resize({ width: w, withoutEnlargement: true }).webp(WEBP).toFile(wOut); made++;
      }
      if (fs.existsSync(aOut)) { skipped++; } else {
        await sharp(abs).resize({ width: w, withoutEnlargement: true }).avif(AVIF).toFile(aOut); made++;
      }
      webpSet.push({ w, src: `assets/generated/webp/${dir}/${name}-${w}.webp` });
      avifSet.push({ w, src: `assets/generated/avif/${dir}/${name}-${w}.avif` });
    }

    // tiny blur-up thumbnail (LQIP)
    const tOut = path.join(GEN, 'thumbnails', dir, `${name}.webp`);
    ensure(tOut);
    if (!fs.existsSync(tOut)) { await sharp(abs).resize({ width: THUMB_W }).blur(1).webp({ quality: 40 }).toFile(tOut); made++; }

    manifest[key] = {
      width, height,
      aspectRatio: +(width / height).toFixed(4),
      webp: webpSet,
      avif: avifSet,
      thumb: `assets/generated/thumbnails/${dir}/${name}.webp`,
      fallback: (webpSet.find((s) => s.w >= 1200) || webpSet[webpSet.length - 1]).src,
    };
    process.stdout.write(`\r  ${Object.keys(manifest).length}/${files.length}  ${key.slice(0, 50).padEnd(50)}`);
  }
  ensure(MANIFEST);
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. masters: ${files.length} | files written: ${made} | skipped(existing): ${skipped}`);
  console.log('Manifest:', path.relative(REPO, MANIFEST));
}
run().catch((e) => { console.error('\nPIPELINE ERROR:', e.message); process.exit(1); });
