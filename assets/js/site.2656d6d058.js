/* Site behaviour: links, theme, pause, pointer physics, Lenis + ScrollTrigger choreography, gallery ring,
   case transitions and diagram signal pulses. Content is complete without this file. */
(() => {
  const root = document.documentElement, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduced = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = root.hasAttribute('data-static');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const NR = window.NR = Object.assign(window.NR || {}, { paused: reduced(), mx: 0, my: 0, push: 0, reduced });

  /* every external link comes from one place (window.LINKS, set in the page head) */
  const L = window.LINKS;
  $$('[data-repo]').forEach(a => { a.href = L.repo(a.dataset.repo); });
  $$('[data-link]').forEach(a => { a.href = L[a.dataset.link]; });

  /* theme: system by default, a manual choice is remembered when storage is available */
  const themeBtn = $('#theme');
  const currentTheme = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const paintTheme = () => {
    const t = currentTheme();
    if (themeBtn) { themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      themeBtn.querySelector('i').className = 'ph ' + (t === 'dark' ? 'ph-sun' : 'ph-moon'); }
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#121418' : '#EEF0F3';
  };
  themeBtn?.addEventListener('click', () => { const next = currentTheme() === 'dark' ? 'light' : 'dark'; root.dataset.theme = next;
    try { localStorage.setItem('nr-theme', next); } catch (e) {} paintTheme(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme); paintTheme();

  /* pause: stops every ambient animation (particles, gallery drift, diagram pulses) */
  const pauseBtn = $('#pause');
  const setPause = p => { NR.paused = p; if (pauseBtn) { pauseBtn.setAttribute('aria-pressed', String(p));
    pauseBtn.querySelector('span').textContent = p ? 'Play motion' : 'Pause motion'; pauseBtn.setAttribute('aria-label', p ? 'Play motion' : 'Pause motion'); pauseBtn.querySelector('i').className = 'ph ' + (p ? 'ph-play' : 'ph-pause'); }
    NR.field?.kick?.(); document.dispatchEvent(new CustomEvent('nr:pause')); };
  setPause(NR.paused); pauseBtn?.addEventListener('click', () => setPause(!NR.paused));

  /* pointer: camera parallax, magnetic buttons, card tilt */
  if (fine && !reduced()) {
    addEventListener('pointermove', e => { NR.mx = e.clientX / innerWidth - .5; NR.my = .5 - e.clientY / innerHeight; NR.field?.kick?.(); }, { passive: true });
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px'); b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px'); });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(1100px) rotateY(${(x * 5).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg)`; });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  /* gallery: 3D ring only when motion is allowed on a wide screen; the flat grid is the default markup */
  const gallery = $('.gallery'), ring = $('.ring');
  const ringOK = gallery && !reduced() && !isStatic && innerWidth >= 900 && CSS.supports('transform-style', 'preserve-3d');
  if (ringOK) {
    gallery.classList.remove('gallery--flat');
    const panels = $$('.ring__panel'), step = 360 / panels.length;
    panels.forEach((p, i) => p.style.setProperty('--a', (i * step) + 'deg'));
    NR.ring = { scroll: 0, lean: 0, tilt: 0 };
    const paintRing = () => { const ry = NR.ring.scroll + NR.ring.lean;
      ring.style.setProperty('--ry', ry.toFixed(2) + 'deg'); ring.style.setProperty('--rx', NR.ring.tilt.toFixed(2) + 'deg');
      /* only the front arc is live: panels turned away are hidden, inert and out of the tab order */
      panels.forEach((p, i) => { let rel = ((i * step + ry) % 360 + 540) % 360 - 180; const away = Math.abs(rel) > 50;
        if (away !== p.classList.contains('away')) { p.classList.toggle('away', away); p.inert = away; away ? p.setAttribute('aria-hidden', 'true') : p.removeAttribute('aria-hidden'); } }); };
    gallery.addEventListener('pointermove', e => { const r = gallery.getBoundingClientRect(); NR.ring.lean = ((e.clientX - r.left) / r.width - .5) * 14; NR.ring.tilt = -((e.clientY - r.top) / r.height - .5) * 8; paintRing(); });
    gallery.addEventListener('pointerleave', () => { NR.ring.lean = 0; NR.ring.tilt = 0; paintRing(); });
    /* keyboard: focusing a panel turns it to the front */
    panels.forEach((p, i) => p.addEventListener('focus', () => { NR.ring.scroll = -i * step; paintRing(); }));
    /* arrow keys turn the ring for keyboard users */
    gallery.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault();
      NR.ring.scroll += (e.key === 'ArrowRight' ? -step : step); paintRing(); const front = panels.find(p => !p.classList.contains('away') && Math.abs(((panels.indexOf(p) * step + NR.ring.scroll + NR.ring.lean) % 360 + 540) % 360 - 180) < step / 2); front?.focus({ preventScroll: true }); });
    NR.paintRing = paintRing; paintRing();
  }

  /* scroll: Lenis (native scroll, no hijack) + ScrollTrigger: SplitText scrub, pinned gallery ring, field anchors */
  const motionOK = !reduced() && !isStatic && window.gsap && window.ScrollTrigger;
  let lenis = null;
  if (motionOK) {
    gsap.registerPlugin(ScrollTrigger); if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Lenis) { lenis = new Lenis({ lerp: .1 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    if (window.SplitText) $$('.split').forEach(el => {
      const st = new SplitText(el, { type: 'words,chars', wordsClass: 'sw' });
      gsap.fromTo(st.chars, { yPercent: 112, rotate: 6 }, { yPercent: 0, rotate: 0, stagger: .018, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 58%', scrub: 1 } });
    });
    if (ringOK) {
      const n = $$('.ring__panel').length, turn = 360 - 360 / n;
      ScrollTrigger.create({ trigger: '.gallery__stage', start: 'top 12%', end: () => '+=' + Math.round(innerHeight * 1.6), pin: '.gallery__pin', pinSpacing: true, scrub: true,
        onUpdate: s => { NR.ring.scroll = -s.progress * turn; NR.paintRing(); } });
    }
    $$('.station__card').forEach(card => gsap.fromTo(card, { y: 40 }, { y: -20, ease: 'none', scrollTrigger: { trigger: card.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    ScrollTrigger.addEventListener('refresh', () => NR.field?.refresh?.());
    addEventListener('load', () => ScrollTrigger.refresh());
  }
  NR.afterField = () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); NR.field?.refresh?.(); };

  /* same-page anchors: smooth with Lenis, focus moves to the target */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1); const t = id ? document.getElementById(id) : null; if (!t) return;
    e.preventDefault(); if (lenis) lenis.scrollTo(t, { offset: -96 }); else t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); history.replaceState(null, '', '#' + id);
  }));

  /* case links: the particle camera pushes in, then the cross-document View Transition carries the title */
  $$('[data-case-link]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || reduced() || !NR.field) return;
    e.preventDefault(); const href = a.href; const t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 380); NR.push = 1 - Math.pow(1 - p, 3); NR.field.kick(); if (p < 1) requestAnimationFrame(step); else location.href = href; };
    requestAnimationFrame(step);
  }));
  addEventListener('pageshow', () => { NR.push = 0; NR.field?.redraw?.(); });

  /* case diagrams: warm signal pulses travel each edge in path order (A), paused off-screen, under Pause and reduced motion */
  $$('svg.dia').forEach(svg => {
    const edges = [...svg.querySelectorAll('path[data-edge-id]')].filter(p => !p.closest('[data-graph-role="automatic-crossover"]') || !p.dataset.graphRole);
    if (!edges.length || reduced() || isStatic) return;
    const NS = 'http://www.w3.org/2000/svg', dots = edges.map(() => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '4.5'); c.setAttribute('class', 'pulse'); c.setAttribute('aria-hidden', 'true'); c.style.opacity = '0'; svg.appendChild(c); return c; });
    const lens = edges.map(p => p.getTotalLength()); let on = false, t = 0, last = 0, raf = 0;
    const per = 1.1, cycle = edges.length * per * .55 + 1.6;
    const tick = now => { raf = 0; const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; if (!NR.paused) t += dt;
      const tc = t % cycle;
      edges.forEach((p, i) => { const f = (tc - i * per * .55) / per; const d = dots[i];
        if (f < 0 || f > 1) { d.style.opacity = '0'; return; }
        const pt = p.getPointAtLength(lens[i] * f); d.setAttribute('cx', pt.x.toFixed(1)); d.setAttribute('cy', pt.y.toFixed(1)); d.style.opacity = String(Math.sin(f * Math.PI)); });
      if (on && !document.hidden) raf = requestAnimationFrame(tick); };
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on && !raf) { last = 0; raf = requestAnimationFrame(tick); } }).observe(svg);
    document.addEventListener('visibilitychange', () => { if (on && !document.hidden && !raf) { last = 0; raf = requestAnimationFrame(tick); } });
  });
})();
