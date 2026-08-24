/* ==========================================================================
   R&R Media — A/B homepage test
   · index.html  = variant A
   · index2.html = variant B
   Assignment is sticky (localStorage) so a returning visitor keeps their
   variant. A small pill in the corner lets the team force either side.
   Delete this file + its <script> tag to ship a single homepage.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'rr-ab-home';
  var PAGES = { a: 'index.html', b: 'index2.html' };
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var mine = here === 'index2.html' ? 'b' : 'a';

  var forced = new URLSearchParams(location.search).get('v');
  if (forced === 'a' || forced === 'b') {
    localStorage.setItem(KEY, forced);
    if (forced !== mine) { location.replace(PAGES[forced]); return; }
  }

  var assigned = localStorage.getItem(KEY);
  if (assigned !== 'a' && assigned !== 'b') {
    assigned = Math.random() < 0.5 ? 'a' : 'b';
    localStorage.setItem(KEY, assigned);
  }
  /* enforce on every load, not just first assignment, so both URLs stay in bucket */
  if (assigned !== mine) { location.replace(PAGES[assigned]); return; }

  document.documentElement.setAttribute('data-ab-variant', mine);

  function go(v) {
    localStorage.setItem(KEY, v);
    if (v !== mine) location.href = PAGES[v];
  }

  function mount() {
    if (document.getElementById('ab-switch')) return;
    var wrap = document.createElement('div');
    wrap.id = 'ab-switch';
    wrap.innerHTML =
      '<span>Variant</span>' +
      '<button type="button" data-v="a"' + (mine === 'a' ? ' class="on"' : '') + '>A</button>' +
      '<button type="button" data-v="b"' + (mine === 'b' ? ' class="on"' : '') + '>B</button>';
    wrap.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute('data-v');
      if (v) go(v);
    });
    document.body.appendChild(wrap);

    var css = document.createElement('style');
    css.textContent =
      '#ab-switch{position:fixed;left:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:6px;' +
      'padding:6px 8px 6px 12px;border-radius:999px;border:1px solid rgba(244,240,236,0.16);' +
      'background:rgba(12,11,11,0.86);backdrop-filter:blur(6px);}' +
      "#ab-switch span{font:500 8px/1 'Sora',sans-serif;letter-spacing:0.18em;text-transform:uppercase;" +
      'color:rgba(244,240,236,0.42);margin-right:2px;}' +
      "#ab-switch button{font:600 11px/1 'Sora',sans-serif;letter-spacing:0.08em;color:rgba(244,240,236,0.55);" +
      'background:none;border:1px solid rgba(244,240,236,0.16);border-radius:999px;width:26px;height:24px;cursor:pointer;' +
      'transition:color .2s,border-color .2s,background .2s;}' +
      '#ab-switch button:hover{color:#F4F0EC;border-color:rgba(244,240,236,0.4);}' +
      '#ab-switch button.on{color:#F4F0EC;background:#C8191A;border-color:#C8191A;}' +
      '@media print{#ab-switch{display:none;}}';
    document.head.appendChild(css);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
