/* ==========================================================================
   R&R Media — A/B homepage test
   · index.html  = variant A
   · index2.html = variant B
   Assignment is sticky (localStorage) so a returning visitor keeps their
   variant. Force a side with ?v=a or ?v=b.
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
})();
