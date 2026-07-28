/* Garden Design Solutions, Inc. — interactions
   Vanilla JS, no external dependencies. Respects prefers-reduced-motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav scroll state ---- */
  var nav = document.getElementById('nav');
  function setNavState() { if (nav) nav.dataset.state = window.scrollY > 40 ? 'scrolled' : 'top'; }
  setNavState();
  window.addEventListener('scroll', setNavState, { passive: true });

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    var closeMenu = function () {
      mobileNav.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    };
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); }
      else {
        mobileNav.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
      }
    });
    mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---- Scroll reveals ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // Cinematic stagger: cascade items within a grid as the group enters.
    document.querySelectorAll('.svc-grid, .plan-grid, .steps, #masonry').forEach(function (grid) {
      var perRow = grid.id === 'masonry';
      Array.prototype.forEach.call(grid.children, function (child, i) {
        if (!child.classList.contains('reveal')) return;
        var d = perRow ? (i % 3) * 90 : Math.min(i, 8) * 80; // gentle, capped
        child.style.transitionDelay = d + 'ms';
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Hero mouse parallax (desktop pointers only) ---- */
  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero-media img');
  if (!reduce && hero && heroImg && window.matchMedia('(pointer:fine)').matches) {
    var hticking = false, hx = 0, hy = 0;
    var applyHero = function () {
      heroImg.style.setProperty('--hpx', (hx * -14).toFixed(1) + 'px');
      heroImg.style.setProperty('--hpy', (hy * -14).toFixed(1) + 'px');
      hticking = false;
    };
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hx = (e.clientX - r.left) / r.width - 0.5;
      hy = (e.clientY - r.top) / r.height - 0.5;
      if (!hticking) { requestAnimationFrame(applyHero); hticking = true; }
    });
    hero.addEventListener('pointerleave', function () {
      heroImg.style.setProperty('--hpx', '0px'); heroImg.style.setProperty('--hpy', '0px');
    });
  }

  /* ---- Parallax on full-bleed dividers ---- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax] img'));
  if (!reduce && parallaxEls.length) {
    var ticking = false;
    var applyParallax = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (img) {
        var rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        var shift = Math.max(-60, Math.min(60, progress * -60));
        img.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(1.12)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; } }, { passive: true });
    window.addEventListener('resize', applyParallax);
    applyParallax();
  }

  /* ---- Portfolio filtering ---- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var emptyMsg = document.getElementById('masonryEmpty');

  function applyFilter(filter) {
    var visible = 0;
    tiles.forEach(function (t) {
      var show = filter === 'all' || t.dataset.cat === filter;
      t.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    chips.forEach(function (c) {
      var active = c.dataset.filter === filter;
      c.classList.toggle('is-active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { applyFilter(c.dataset.filter); }); });
  document.querySelectorAll('[data-jump]').forEach(function (link) {
    link.addEventListener('click', function () { applyFilter(link.getAttribute('data-jump')); });
  });
  var jumpAll = document.querySelector('[data-jump-all]');
  if (jumpAll) jumpAll.addEventListener('click', function () { applyFilter('all'); });

  /* ==========================================================================
     Lightbox with zoom / pan
     ========================================================================== */
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var lbImg = document.getElementById('lbImg');
  var lbFigure = document.getElementById('lbFigure');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbIn = document.getElementById('lbZoomIn');
  var lbOut = document.getElementById('lbZoomOut');
  var lbFull = document.getElementById('lbFull');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
  var currentList = [];
  var currentIndex = 0;
  var lastFocused = null;

  // zoom state
  var scale = 1, tx = 0, ty = 0;
  var MIN = 1, MAX = 5;

  function buildList(group, current) {
    currentList = triggers.filter(function (b) {
      if (b.getAttribute('data-group') !== group) return false;
      var tile = b.closest('.tile');
      return !(tile && tile.classList.contains('is-hidden'));
    });
    currentIndex = Math.max(0, currentList.indexOf(current));
  }

  function clampPan() {
    var maxX = Math.max(0, (lbImg.clientWidth * scale - lbFigure.clientWidth) / 2);
    var maxY = Math.max(0, (lbImg.clientHeight * scale - lbFigure.clientHeight) / 2);
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  }
  function render() {
    clampPan();
    lbImg.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
    lightbox.toggleAttribute('data-zoomed', scale > 1.01);
  }
  function resetZoom() { scale = 1; tx = 0; ty = 0; lbImg.style.transition = ''; render(); }

  // zoom toward a point given relative to the figure centre (cx, cy in px)
  function zoomTo(next, cx, cy) {
    next = Math.max(MIN, Math.min(MAX, next));
    if (next === scale) return;
    tx = cx - next * (cx - tx) / scale;
    ty = cy - next * (cy - ty) / scale;
    scale = next;
    render();
  }
  function centreOffset(clientX, clientY) {
    var r = lbFigure.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  }

  function showAt(index) {
    if (!currentList.length) return;
    currentIndex = (index + currentList.length) % currentList.length;
    var btn = currentList[currentIndex];
    resetZoom();
    lbImg.src = btn.getAttribute('data-full');
    lbImg.alt = btn.getAttribute('data-alt') || '';
    lbCap.textContent = btn.getAttribute('data-caption') || '';
  }

  function openLightbox(btn) {
    buildList(btn.getAttribute('data-group'), btn);
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { lightbox.setAttribute('data-open', ''); });
    document.body.style.overflow = 'hidden';
    showAt(currentIndex);
    lbClose.focus();
    document.addEventListener('keydown', onKey);
  }
  function closeLightbox() {
    if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); }
    lightbox.removeAttribute('data-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    var finish = function () { lightbox.hidden = true; lbImg.src = ''; };
    if (reduce) finish(); else setTimeout(finish, 350);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') showAt(currentIndex + 1);
    else if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
    else if (e.key === '+' || e.key === '=') { lbImg.style.transition = ''; zoomTo(scale * 1.4, 0, 0); }
    else if (e.key === '-' || e.key === '_') { lbImg.style.transition = ''; zoomTo(scale / 1.4, 0, 0); }
    else if (e.key === '0') resetZoom();
    else if (e.key === 'Tab') {
      var f = [lbOut, lbIn, lbFull, lbClose, lbPrev, lbNext];
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      var n = e.shiftKey ? i - 1 : i + 1;
      f[(n + f.length) % f.length].focus();
    }
  }

  triggers.forEach(function (btn) { btn.addEventListener('click', function () { openLightbox(btn); }); });
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { showAt(currentIndex - 1); });
  lbNext.addEventListener('click', function () { showAt(currentIndex + 1); });
  lbIn.addEventListener('click', function () { lbImg.style.transition = ''; zoomTo(scale * 1.5, 0, 0); });
  lbOut.addEventListener('click', function () { lbImg.style.transition = ''; zoomTo(scale / 1.5, 0, 0); });
  lbFull.addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else if (lightbox.requestFullscreen) lightbox.requestFullscreen().catch(function () {});
  });
  // click empty backdrop closes
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === lbFigure) closeLightbox();
  });

  /* Wheel zoom (desktop) */
  lbFigure.addEventListener('wheel', function (e) {
    e.preventDefault();
    var o = centreOffset(e.clientX, e.clientY);
    lbImg.style.transition = '';
    zoomTo(scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), o.x, o.y);
  }, { passive: false });

  /* Double-click / double-tap toggle zoom */
  lbImg.addEventListener('dblclick', function (e) {
    var o = centreOffset(e.clientX, e.clientY);
    lbImg.style.transition = reduce ? '' : 'transform .28s';
    if (scale > 1.01) resetZoom(); else zoomTo(2.5, o.x, o.y);
  });

  /* Pointer drag pan + pinch zoom */
  var pointers = new Map();
  var startPan = null, pinchStart = null;
  lbFigure.addEventListener('pointerdown', function (e) {
    if (e.target === lbFigure) return; // backdrop-close handles empties
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { lbFigure.setPointerCapture(e.pointerId); } catch (err) {}
    lbImg.style.transition = '';
    if (pointers.size === 1 && scale > 1.01) {
      startPan = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      lightbox.setAttribute('data-panning', '');
    } else if (pointers.size === 2) {
      var p = Array.from(pointers.values());
      pinchStart = { dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), scale: scale };
      startPan = null;
    }
  });
  lbFigure.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchStart) {
      var p = Array.from(pointers.values());
      var dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      var mid = centreOffset((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
      zoomTo(pinchStart.scale * (dist / pinchStart.dist), mid.x, mid.y);
    } else if (startPan) {
      tx = startPan.tx + (e.clientX - startPan.x);
      ty = startPan.ty + (e.clientY - startPan.y);
      render();
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) { startPan = null; lightbox.removeAttribute('data-panning'); }
  }
  lbFigure.addEventListener('pointerup', endPointer);
  lbFigure.addEventListener('pointercancel', endPointer);

  window.addEventListener('resize', function () { if (!lightbox.hidden) render(); });

  /* ---- Netlify form success note ---- */
  if (/[?&]sent=1/.test(window.location.search)) {
    var note = document.getElementById('formNote');
    if (note) { note.hidden = false; note.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
  }
})();
