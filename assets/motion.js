/* Relief Corps Organization - motion layer (pairs with assets/motion.css)
   Part 1: page-leave transition, entrance + scroll reveal
   Part 2: floating decorations that drift with scroll and mouse */

/* ================= Part 1: transitions + reveal ================= */
(function () {
  var d = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  /* ---- Page leave transition (works everywhere, including file://) ---- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    if (a.protocol !== location.protocol || a.host !== location.host) return;   // external, mailto:, tel:
    if (a.pathname === location.pathname && a.search === location.search) return; // same page / #anchor
    e.preventDefault();
    d.classList.add('rco-leave');
    setTimeout(function () { location.href = a.href; }, 230);
  });
  // Back/forward cache: make sure a restored page is not stuck faded out
  window.addEventListener('pageshow', function (e) { if (e.persisted) d.classList.remove('rco-leave'); });

  /* ---- Entrance + scroll reveal ---- */
  if (!('IntersectionObserver' in window)) return;
  d.classList.add('rco-m'); // hides reveal targets via CSS until they are shown

  // NOTE: keep in sync with the selector list in motion.css.
  // m = stagger resets every m items (for grids); 0 = simple capped stagger.
  var GROUPS = [
    ['.pagehead>:not(.fl)', 0], ['.hero-grid>div>*', 0], ['.hero .side', 0], ['.banner', 0], ['.hero-photo', 0],
    ['.statement>:not(.fl)', 0], ['.section>.eyebrow', 0], ['.section>h2', 0],
    ['.cards>.card', 3], ['.principles>div', 3], ['.two-col>*', 0], ['.photos>*', 3],
    ['.mosaic>figure', 3], ['.loc>:not(.fl)', 0], ['.partner-grid>*', 0], ['.band .wrap>*', 0]
  ];

  function indexIn(el) {
    var i = 0, n = el;
    while ((n = n.previousElementSibling)) i++;
    return i;
  }

  function arm() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('rco-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    GROUPS.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el) {
        var i = indexIn(el);
        var step = g[1] ? i % g[1] : Math.min(i, 4);
        el.style.transitionDelay = (step * 80) + 'ms';
        io.observe(el);
      });
    });
  }

  function start() {
    try { arm(); } catch (err) { d.classList.remove('rco-m'); } // never leave content hidden
  }

  // On the first visit of a session the logo preloader is showing: wait for it.
  function whenReady(cb) {
    if (!d.classList.contains('pl-on')) return cb();
    var fired = false;
    var mo = new MutationObserver(function () { if (!d.classList.contains('pl-on')) go(); });
    function go() { if (fired) return; fired = true; mo.disconnect(); cb(); }
    mo.observe(d, { attributes: true, attributeFilter: ['class'] });
    setTimeout(go, 4600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { whenReady(start); });
  } else {
    whenReady(start);
  }
})();

/* ================= Part 2: floating decorations ================= */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Placement plan. k = shape, c = colour, s = size px, p = position,
     d = depth (how strongly it reacts), b = sits behind content,
     r = rotation, h = hide on small screens ('md' <=860px, 'sm' <=560px). */
  var PLAN = [
    ['.hero .side', [
      { k: 'ring', c: 'teal',  s: 96,  p: { top: '-34px', right: '-30px' }, d: .7 },
      { k: 'grid', c: 'coral', s: 84,  p: { top: '42%', left: '-34px' }, d: .35, b: 1, h: 'sm' },
      { k: 'dot',  c: 'sun',   s: 24,  p: { top: '14%', left: '-12px' }, d: 1.1 }]],
    ['.banner', [
      { k: 'blob', c: 'lilac', s: 150, p: { top: '-60px', right: '-40px' }, d: .4, b: 1 },
      { k: 'plus', c: 'coral', s: 30,  p: { top: '-14px', left: '12%' }, d: .9, h: 'sm' }]],
    ['.hero-photo', [
      { k: 'grid', c: 'sun',   s: 90,  p: { top: '-30px', left: '-26px' }, d: .4, b: 1, h: 'sm' },
      { k: 'ring', c: 'coral', s: 70,  p: { top: '-26px', right: '-22px' }, d: .8 },
      { k: 'dot',  c: 'teal',  s: 20,  p: { top: '46%', right: '-10px' }, d: 1.1, h: 'sm' }]],
    ['.pagehead', [
      { k: 'blob', c: 'teal',  s: 140, p: { top: '20px', right: '6%' }, d: .35, b: 1 },
      { k: 'ring', c: 'lilac', s: 80,  p: { top: '44px', right: '2%' }, d: .7, b: 1 },
      { k: 'bars', c: 'teal',  s: 54,  p: { bottom: '34px', right: '12%' }, d: .9, b: 1, r: '-14deg', h: 'md' }]],
    ['.statement', [
      { k: 'plus', c: 'lilac', s: 34,  p: { top: '46px', right: '4%' }, d: .8, h: 'md' },
      { k: 'dot',  c: 'coral', s: 16,  p: { top: '92px', right: '9%' }, d: 1.2, h: 'md' }]],
    ['.cards', [
      { k: 'blob', c: 'lilac', s: 260, p: { bottom: '-80px', right: '-60px' }, d: .25, b: 1 },
      { k: 'ring', c: 'sun',   s: 60,  p: { top: '-30px', right: '6%' }, d: .6, b: 1, h: 'sm' }]],
    ['.band', [
      { k: 'ring', c: 'teal',  s: 220, p: { top: '-70px', right: '-50px' }, d: .3, b: 1 },
      { k: 'grid', c: 'sun',   s: 90,  p: { bottom: '24px', left: '4%' }, d: .5, b: 1, h: 'sm' },
      { k: 'dot',  c: 'coral', s: 20,  p: { bottom: '48px', right: '14%' }, d: 1, b: 1 }]]
  ];
  // "Where we work": one pair per location block, colours alternate
  function locPlan(i) {
    return [
      { k: 'ring', c: i % 2 ? 'coral' : 'teal',  s: 64, p: { top: '22px', left: '49%' }, d: .8, h: 'md' },
      { k: 'dot',  c: i % 2 ? 'sun' : 'lilac',   s: 18, p: { bottom: '-8px', left: '53%' }, d: 1.2, h: 'md' }];
  }

  var hosts = [];

  function build() {
    PLAN.forEach(function (row) { document.querySelectorAll(row[0]).forEach(function (el) { add(el, row[1]); }); });
    document.querySelectorAll('.loc').forEach(function (el, i) { add(el, locPlan(i)); });
  }

  function add(host, items) {
    host.classList.add('fl-host');
    var rec = { el: host, items: [], vis: false };
    items.forEach(function (it, n) {
      var o = document.createElement('span');
      o.className = 'fl fl-' + it.k + (it.b ? ' back' : '') + (it.h ? ' hide-' + it.h : '');
      o.setAttribute('aria-hidden', 'true');
      for (var side in it.p) o.style[side] = it.p[side];
      var i = document.createElement('i');
      i.style.setProperty('--s', it.s);
      i.style.setProperty('--c', 'var(--fl-' + it.c + ')');
      i.style.setProperty('--t', (7 + ((n * 2 + hosts.length) % 5)) + 's');
      i.style.setProperty('--dl', '-' + ((n * 3 + hosts.length * 2) % 9) + 's');
      if (it.r) i.style.setProperty('--r', it.r);
      o.appendChild(i);
      host.appendChild(o);
      rec.items.push({ el: o, d: it.d });
    });
    hosts.push(rec);
  }

  /* ---- motion: scroll + mouse parallax (skipped for reduced motion) ---- */
  var raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;

  function apply() {
    var vh = window.innerHeight || 1;
    hosts.forEach(function (h) {
      if (!h.vis) return;
      var r = h.el.getBoundingClientRect();
      var off = (r.top + r.height / 2 - vh / 2) / vh;          // roughly -1 .. 1
      h.items.forEach(function (it) {
        var x = cx * 16 * it.d;
        var y = cy * 16 * it.d - off * 70 * it.d;
        var rot = off * 22 * it.d;
        it.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg)';
      });
    });
  }
  function tick() {
    raf = 0;
    cx += (tx - cx) * .08;
    cy += (ty - cy) * .08;
    apply();
    if (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) req();
  }
  function req() { if (!raf) raf = requestAnimationFrame(tick); }

  function init() {
    try {
      build();
      if (!('IntersectionObserver' in window)) { hosts.forEach(function (h) { h.items.forEach(function (it) { it.el.classList.add('on'); }); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var h = hosts.filter(function (x) { return x.el === en.target; })[0];
          if (!h) return;
          h.vis = en.isIntersecting;
          if (en.isIntersecting) h.items.forEach(function (it) { it.el.classList.add('on'); });
        });
        if (!reduce) req();
      }, { rootMargin: '120px 0px' });
      hosts.forEach(function (h) { io.observe(h.el); });

      if (reduce) return; // decorations stay still
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', req);
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        tx = (e.clientX / (window.innerWidth || 1) - .5) * 2;
        ty = (e.clientY / (window.innerHeight || 1) - .5) * 2;
        req();
      }, { passive: true });
    } catch (err) { /* decorations are optional */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
