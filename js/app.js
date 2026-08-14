/* ==========================================================================
   R&R Media — shared behaviour
   · trending ticker (fetches trends/feed.json, re-polls every 15 min)
   · nav: solid-on-scroll + shrink to the ringless mark
   · mobile menu
   · scroll reveal
   · lead-source tracking for the contact form
   ========================================================================== */
(function () {
  'use strict';

  /* ── Trending ticker ──────────────────────────────────────────────────── */
  var FEED_URL = 'trends/feed.json';
  var POLL_MINUTES = 15;
  var TICKER_SPEED = 60; // px per second

  var SOURCE_COLORS = {
    google: '#7FA6E8', tiktok: '#6FD6C4', instagram: '#DE8BB1',
    reddit: '#E8A470', youtube: '#E87D7A'
  };

  var ICONS = {
    google: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M21 12h-8.5"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M14 3c.3 2.1 1.7 3.7 3.8 4v2.4c-1.4 0-2.7-.4-3.8-1.2v5.9a4.9 4.9 0 1 1-4.9-4.9c.3 0 .6 0 .9.1v2.5a2.4 2.4 0 1 0 1.7 2.3V3H14z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    reddit: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M22 11.6a2 2 0 0 0-3.4-1.4 9.7 9.7 0 0 0-4.7-1.5l.9-4 2.8.6a1.4 1.4 0 1 0 .2-1.2l-3.5-.8-1.2 5.4a9.8 9.8 0 0 0-4.9 1.5A2 2 0 1 0 3.6 13a3.7 3.7 0 0 0-.1.9c0 2.9 3.8 5.2 8.5 5.2s8.5-2.3 8.5-5.2a3.7 3.7 0 0 0-.1-.9 2 2 0 0 0 1.1-1.4zM8 13.2a1.3 1.3 0 1 1 1.3 1.3A1.3 1.3 0 0 1 8 13.2zm7.4 3.3a4.7 4.7 0 0 1-3.4 1.1 4.7 4.7 0 0 1-3.4-1.1.4.4 0 0 1 .6-.6 3.9 3.9 0 0 0 2.8.9 3.9 3.9 0 0 0 2.8-.9.4.4 0 1 1 .6.6zm-.1-2a1.3 1.3 0 1 1 1.3-1.3 1.3 1.3 0 0 1-1.3 1.3z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="3.5"/><path d="M10 9.3l5.2 2.7-5.2 2.7z" fill="currentColor" stroke="none"/></svg>'
  };

  // Fallback list — shown if trends/feed.json is missing or malformed.
  var FALLBACK = [
    { source: 'google', title: 'solar eclipse 2026', traffic: '2M+ searches', url: 'https://trends.google.com/trending?geo=US' },
    { source: 'tiktok', title: '#cabincore', traffic: '48M views', url: 'https://www.tiktok.com/tag/cabincore' },
    { source: 'instagram', title: '#setlife', traffic: '2.1M posts', url: 'https://www.instagram.com/explore/tags/setlife/' },
    { source: 'reddit', title: 'Scientists confirm breakthrough in fusion energy timeline', traffic: '142K upvotes', url: 'https://www.reddit.com/r/popular/' },
    { source: 'youtube', title: 'Official Trailer — the one everyone is talking about', traffic: '8.4M views', url: 'https://www.youtube.com' },
    { source: 'google', title: 'nba finals game 5', traffic: '1M+ searches', url: 'https://trends.google.com/trending?geo=US' },
    { source: 'tiktok', title: '#filmmaking', traffic: '12M views', url: 'https://www.tiktok.com/tag/filmmaking' },
    { source: 'instagram', title: '#nashville', traffic: '890K posts', url: 'https://www.instagram.com/explore/tags/nashville/' },
    { source: 'reddit', title: 'This practical effect took our crew 6 weeks to build', traffic: '98K upvotes', url: 'https://www.reddit.com/r/popular/' },
    { source: 'google', title: 'tropical storm update', traffic: '500K+ searches', url: 'https://trends.google.com/trending?geo=US' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function renderTicker(feed) {
    var track = document.querySelector('.ttk-track');
    if (!track) return;
    var items = (feed && feed.items && feed.items.length) ? feed.items : FALLBACK;

    var html = items.map(function (it) {
      var color = SOURCE_COLORS[it.source] || '#9aa4b2';
      var icon = ICONS[it.source] || '';
      return '<a class="ttk-item" href="' + esc(it.url) + '" target="_blank" rel="noopener">' +
        '<span class="ttk-icon" style="color:' + color + '">' + icon + '</span>' +
        '<span class="ttk-title">' + esc(it.title) + '</span>' +
        '<span class="ttk-traffic">' + esc(it.traffic || '') + '</span>' +
        '<span class="ttk-sep">&#9642;</span></a>';
    }).join('');

    track.innerHTML = html + html;               // duplicated set → seamless -50% loop
    track.style.animationDuration = Math.max(20, Math.round(items.length * 320 / TICKER_SPEED)) + 's';

    var upd = document.querySelector('.ttk-upd');
    if (upd) {
      upd.textContent = (feed && feed.updatedAt)
        ? 'UPD ' + new Date(feed.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'LIVE';
    }
  }

  function loadFeed() {
    fetch(FEED_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(renderTicker)
      .catch(function (err) {
        console.warn('[trend-ticker] feed fetch failed:', err.message);
        renderTicker(null);
      });
  }

  /* ── Nav ──────────────────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById('rr-nav');
    if (!nav) return;
    // Home page nav starts transparent; inner pages opt out with data-solid.
    var alwaysSolid = nav.hasAttribute('data-solid');

    function onScroll() {
      var past = window.scrollY > 60;
      nav.classList.toggle('rr-shrunk', past);
      nav.classList.toggle('rr-solid', alwaysSolid || past);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var btn = document.getElementById('rr-menu-btn');
    var menu = document.getElementById('rr-mobile-menu');
    if (btn && menu) {
      var setMenu = function (open) {
        btn.classList.toggle('is-open', open);
        menu.classList.toggle('is-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      };
      btn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
      });
    }
  }

  /* ── Scroll reveal ────────────────────────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transition = 'none';
        el.classList.add('revealed');
        void el.getBoundingClientRect();
        el.style.transition = '';
      } else {
        obs.observe(el);
      }
    });
  }

  /* ── Lead-source tracking ─────────────────────────────────────────────── */
  function pageName() {
    var n = decodeURIComponent((location.pathname.split('/').pop() || 'index'));
    return (n.replace(/\.html$/i, '').trim() || 'index').toLowerCase();
  }

  function fillLeadSource() {
    var d = null;
    try { d = JSON.parse(sessionStorage.getItem('rrLeadSource') || 'null'); } catch (e) {}
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.value = v; };
    if (!d) { set('lead_entry', document.referrer || 'direct'); return; }
    set('lead_cta', d.cta);
    set('lead_section', d.section);
    set('lead_page', d.page);
    set('lead_clicked_at', d.at);
    set('lead_entry', d.page + ' \u203A ' + d.section + ' \u203A ' + d.cta);
  }

  function initLeadTracking() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#contact"]');
      if (!a) return;
      var sec = a.closest('section[id], .svc-item[id]') || a.closest('[id]');
      var inNav = !!(a.closest('#rr-nav') || a.closest('#rr-mobile-menu'));
      var label = (a.getAttribute('data-cta') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
      try {
        sessionStorage.setItem('rrLeadSource', JSON.stringify({
          cta: label || 'Contact',
          section: inNav ? 'nav' : (sec && sec.id ? sec.id : 'page'),
          page: pageName(),
          at: new Date().toISOString()
        }));
      } catch (err) {}
      setTimeout(fillLeadSource, 60);
    }, true);

    fillLeadSource();
    window.addEventListener('hashchange', fillLeadSource);
  }

  /* ── Boot ─────────────────────────────────────────────────────────────── */
  function init() {
    initNav();
    initReveal();
    initLeadTracking();
    if (document.querySelector('.ttk-track')) {
      loadFeed();
      setInterval(loadFeed, POLL_MINUTES * 60 * 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
