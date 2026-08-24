/* ==========================================================================
   R&R Media — services page behaviour
   · accordion (deep-linkable, keeps the open header pinned below the nav)
   · phone carousel (auto-advance, drag, dots)
   · targeted-ads audience switcher
   ========================================================================== */
(function () {
  'use strict';

  var NAV_OFFSET = 150;

  /* ── Accordion ────────────────────────────────────────────────────────── */
  function initAccordion() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-svc]'));
    if (!items.length) return;

    function setActive(idx, scroll) {
      items.forEach(function (el, i) { el.classList.toggle('open', i === idx); });
      if (scroll && items[idx]) {
        window.scrollTo({
          top: items[idx].getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
          behavior: 'smooth'
        });
      }
    }

    items.forEach(function (el, i) {
      var header = el.querySelector('.svc-header');
      if (!header) return;
      header.addEventListener('click', function () {
        var isOpen = el.classList.contains('open');
        setActive(isOpen ? -1 : i, false);
        if (isOpen) return;
        // Track the header through the 0.5s expand so it stays put under the nav.
        var start = performance.now();
        (function step() {
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: 'instant' });
          if (performance.now() - start < 620) requestAnimationFrame(step);
        })();
      });
    });

    var hash = (location.hash || '').replace('#', '');
    var idx = items.findIndex(function (el) { return el.id === hash; });
    setActive(idx, false);
    if (idx > -1) setTimeout(function () { setActive(idx, true); }, 200);
  }

  /* ── Phone carousel ───────────────────────────────────────────────────── */
  function initCarousel() {
    var stage = document.querySelector('.car-stage');
    if (!stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.car-card-abs'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-car-dot]'));
    var N = cards.length;
    if (!N) return;

    var active = 3;
    var paused = false;
    var drag = null;

    function paint() {
      cards.forEach(function (card, i) {
        var offset = i - active;
        if (offset > N / 2) offset -= N;
        if (offset < -N / 2) offset += N;
        var abs = Math.abs(offset);
        var visible = abs <= 3;
        var scale = visible ? 1 - abs * 0.15 : 0.55;

        card.style.transform = 'translate(-50%,-50%) translateX(' + (offset * (cards[0].offsetWidth * 0.56)) + 'px) translateY(' + (abs * 14) + 'px) scale(' + scale + ')';
        card.style.opacity = visible ? Math.max(0, 1 - abs * 0.25) : 0;
        card.style.zIndex = 100 - abs;
        card.style.filter = 'blur(' + (visible ? abs * 1.1 : 5) + 'px)';
        card.style.pointerEvents = visible ? 'auto' : 'none';
        card.classList.toggle('is-active', offset === 0);
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === active); });
    }

    function go(i) {
      active = ((i % N) + N) % N;
      paint();
    }

    stage.addEventListener('mouseenter', function () { paused = true; });
    stage.addEventListener('mouseleave', function () { drag = null; paused = false; });
    stage.addEventListener('mousedown', function (e) {
      e.preventDefault();
      drag = { x: e.clientX, startActive: active, moved: false };
    });
    stage.addEventListener('mousemove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) drag.moved = true;
      go(drag.startActive + Math.round(-dx / 108));
    });
    stage.addEventListener('mouseup', function (e) {
      if (drag && !drag.moved) {
        var card = e.target.closest && e.target.closest('.car-card-abs');
        var i = card ? cards.indexOf(card) : -1;
        if (i > -1) go(i);
      }
      drag = null;
    });

    // Touch: swipe left/right
    var touchX = null;
    stage.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; paused = true; }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (touchX === null) return;
      var dx = e.touches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { go(active + (dx < 0 ? 1 : -1)); touchX = e.touches[0].clientX; }
    }, { passive: true });
    stage.addEventListener('touchend', function () { touchX = null; paused = false; });

    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });

    setInterval(function () { if (!paused) go(active + 1); }, 2200);
    paint();
  }

  /* ── Targeted ads: audience switcher ──────────────────────────────────── */
  var AD_CAMPAIGNS = [
    { reach: '1.4M+', engagement: '9.1%',  conversions: '22,318', roas: '3.6×' },
    { reach: '2.1M+', engagement: '11.2%', conversions: '31,905', roas: '4.6×' },
    { reach: '1.2M+', engagement: '8.7%',  conversions: '24,631', roas: '3.2×' }
  ];

  function initAds() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-ad-node]'));
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-ad-layer]'));
    if (!nodes.length) return;

    function select(i) {
      nodes.forEach(function (n, j) { n.classList.toggle('is-active', j === i); });
      layers.forEach(function (l, j) { l.classList.toggle('is-shown', j === i); });
      var c = AD_CAMPAIGNS[i];
      if (!c) return;
      Object.keys(c).forEach(function (k) {
        var el = document.querySelector('[data-ad-stat="' + k + '"]');
        if (el) el.textContent = c[k];
      });
    }

    nodes.forEach(function (n, i) { n.addEventListener('click', function () { select(i); }); });
    select(0);
  }

  function init() {
    initAccordion();
    initCarousel();
    initAds();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
