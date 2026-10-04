(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Hero entrance: wait for the drain image so the sequence doesn't start on an empty stage.
  const drain = document.getElementById('heroDrain');
  const start = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
  if (drain.complete) start(); else { drain.addEventListener('load', start); drain.addEventListener('error', start); }
  setTimeout(start, 1500);

  // Scroll reveals (once).
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Scroll-linked: nav, water line, parallax. One rAF-throttled handler, transform only.
  const nav = document.getElementById('nav');
  const line = document.querySelector('.waterline i');
  const scene = document.getElementById('sceneImg');
  const sceneFrame = scene.parentElement;
  const hero = document.getElementById('hero');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = root.scrollHeight - innerHeight;
    nav.classList.toggle('is-solid', y > 40);
    line.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (reduce) return;

    if (y < innerHeight * 1.2) {
      drain.style.translate = `0 ${(y * 0.12).toFixed(1)}px`;
    }
    const r = sceneFrame.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
      scene.style.setProperty('--y', `${(t * -6).toFixed(2)}%`);
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  // Hero drain follows the pointer with spring-like lag (decorative, fine pointers only).
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    hero.addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth - 0.5) * -18;
      ty = (e.clientY / innerHeight - 0.5) * -12;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      drain.style.rotate = `${(cx * 0.05).toFixed(3)}deg`;
      drain.style.marginLeft = `${cx.toFixed(2)}px`;
      drain.style.marginTop = `${cy.toFixed(2)}px`;
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : 0;
    };
  }

  // Finish selector. Preview tint is a stand-in until per-finish renders are supplied.
  const tint = {
    Gold: 'none',
    Silver: 'saturate(0) brightness(1.35) contrast(.95)',
    Black: 'saturate(0) brightness(.55) contrast(1.1)'
  };
  const img = document.getElementById('productImg');
  const tag = document.getElementById('finishTag');
  const swatches = [...document.querySelectorAll('.swatch')];
  swatches.forEach((s) => s.addEventListener('click', () => {
    swatches.forEach((o) => o.setAttribute('aria-checked', String(o === s)));
    img.style.filter = tint[s.dataset.finish];
    tag.textContent = s.dataset.finish;
  }));
})();
