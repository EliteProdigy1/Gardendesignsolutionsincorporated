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
  function setNavState() {
    if (!nav) return;
    nav.dataset.state = window.scrollY > 40 ? 'scrolled' : 'top';
  }
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
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeMenu(); }
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
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
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
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -~ to +~
        var shift = Math.max(-60, Math.min(60, progress * -60));
        img.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(1.12)';
      });
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
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
    rebuildLightboxList();
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () { applyFilter(c.dataset.filter); });
  });

  /* ---- Discipline cards jump to filtered portfolio ---- */
  document.querySelectorAll('[data-jump]').forEach(function (link) {
    link.addEventListener('click', function () {
      applyFilter(link.getAttribute('data-jump'));
    });
  });

  /* ==========================================================================
     Lightbox
     ========================================================================== */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbButtons = Array.prototype.slice.call(document.querySelectorAll('.tile-btn'));
  var currentList = [];
  var currentIndex = 0;
  var lastFocused = null;

  function rebuildLightboxList() {
    currentList = lbButtons.filter(function (b) {
      return !b.closest('.tile').classList.contains('is-hidden');
    });
  }
  rebuildLightboxList();

  function showAt(index) {
    if (!currentList.length) return;
    currentIndex = (index + currentList.length) % currentList.length;
    var btn = currentList[currentIndex];
    lbImg.src = btn.getAttribute('data-full');
    lbImg.alt = btn.getAttribute('data-alt') || '';
    lbCap.textContent = btn.getAttribute('data-cat-label') || '';
  }

  function openLightbox(btn) {
    rebuildLightboxList();
    var idx = currentList.indexOf(btn);
    if (idx < 0) idx = 0;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { lightbox.setAttribute('data-open', ''); });
    document.body.style.overflow = 'hidden';
    showAt(idx);
    lbClose.focus();
    document.addEventListener('keydown', onKey);
  }

  function closeLightbox() {
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
    else if (e.key === 'Tab') {
      // simple focus trap across the three controls
      var focusables = [lbClose, lbPrev, lbNext];
      var i = focusables.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? i - 1 : i + 1;
      focusables[(next + focusables.length) % focusables.length].focus();
    }
  }

  lbButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { showAt(currentIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { showAt(currentIndex + 1); });
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

  /* ---- Netlify form success note (when redirected back with ?sent=1) ---- */
  if (/[?&]sent=1/.test(window.location.search)) {
    var note = document.getElementById('formNote');
    if (note) {
      note.hidden = false;
      note.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }
})();
