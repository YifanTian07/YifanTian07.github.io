(() => {
  'use strict';
  const root = document.documentElement;
  const groups = [
    { id: 'about', en: 'About me', zh: '个人简介', sub: ['A little context', '关于我'] },
    { id: 'research', en: 'Research interests', zh: '研究兴趣', sub: ['Questions I work on', '正在探索的问题'] },
    { id: 'publications', en: 'Papers', zh: '论文发表', sub: ['Research in print', '论文与研究成果'] },
    { id: 'work', en: 'Projects', zh: '项目经历', sub: ['Things I am building', '正在构建的系统'] }
  ];
  const ui = document.createElement('section');
  ui.className = 'universe';
  ui.setAttribute('aria-label', 'Portfolio constellation');
  ui.innerHTML = `<canvas aria-hidden="true"></canvas>
    <div class="space-heading"><p>YIFAN TIAN / HKUST(GZ)</p><h1></h1><p class="space-bio"></p></div>
    <div class="space-tools"><button data-reading></button><button data-motion aria-pressed="false"></button></div>
    <div class="space-links"><button data-section="ventures"></button><button data-section="blog"></button><button data-section="contact"></button></div>
    <div class="space-stage"></div>
    <div class="space-controls"><button data-back hidden></button><button data-prev aria-label="Previous">←</button><span class="space-count" aria-live="polite"></span><button class="space-open" data-open></button><button data-next aria-label="Next">→</button></div>
    <p class="space-help"></p>`;
  document.body.append(ui);
  const returnButton = document.createElement('button');
  returnButton.className = 'space-mode-return';
  document.body.append(returnButton);
  const stage = ui.querySelector('.space-stage');
  const canvas = ui.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) { ui.remove(); returnButton.remove(); return; }
  let group = 0, item = 0, detail = false, nodes = [], active = true;
  let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phase = 0, shift = 0, expanded = 0, w = 1, h = 1, last = 0, wheelAt = 0;
  let pointer = { x: 0, y: 0 }, frame = 0;
  const language = () => root.lang.startsWith('zh') ? 'zh' : 'en';
  const text = (en, zh) => language() === 'zh' ? zh : en;
  const clean = (el) => el ? el.textContent.trim() : '';
  const el = (tag, value, cls) => { const node = document.createElement(tag); if (value) node.textContent = value; if (cls) node.className = cls; return node; };
  const wrap = (value, count) => ((value % count) + count) % count;
  function contents() {
    const id = groups[group].id;
    if (id === 'about') return [
      { title: 'Yifan Tian', paragraphs: [text('Year 2 · HKUST(GZ) · ROAS + AI · Class of 2025', '大二 · 香港科技大学（广州）· ROAS + AI · 2025 级'), clean(document.querySelector('.about-copy .lead')), clean(document.querySelector('[data-i18n="about.body1"]'))] },
      { title: text('Research & building', '科研与实践'), paragraphs: [clean(document.querySelector('[data-i18n="about.body2"]')), clean(document.querySelector('[data-i18n="research.experience.title"]'))], links: [{ href: '#research', label: text('Research interests', '研究兴趣') }] },
      { title: text('Get in touch', '联系我'), paragraphs: [text('Guangzhou, China. Open to research and project collaborations.', '常驻广州，欢迎交流研究问题与项目合作。')], links: [{ href: 'mailto:ytian515@connect.hkust-gz.edu.cn', label: 'ytian515@connect.hkust-gz.edu.cn' }, { href: 'tel:+8618401250620', label: '+86 184 0125 0620' }, { href: 'https://github.com/YifanTian07', label: 'GitHub ↗' }] }
    ];
    if (id === 'research') return [...document.querySelectorAll('.interest-item')].map(node => ({ title: clean(node.querySelector('h3')), paragraphs: [...node.querySelectorAll('p')].map(clean) }));
    if (id === 'publications') return [...document.querySelectorAll('.publication')].map(node => ({ title: clean(node.querySelector('h3')), paragraphs: [...node.querySelectorAll('.publication-main p')].map(clean), image: node.querySelector('img')?.getAttribute('src'), alt: node.querySelector('img')?.alt, links: [...node.querySelectorAll('.circle-link')].map(a => ({ href: a.getAttribute('href'), label: text('Read on arXiv ↗', '在 arXiv 阅读 ↗') })) }));
    return [...document.querySelectorAll('.project-grid > .project')].map(node => ({ title: clean(node.querySelector('h3')), paragraphs: [clean(node.querySelector('.project-copy p'))], links: node.tagName === 'A' ? [{ href: node.getAttribute('href'), label: text('Explore project ↗', '查看项目 ↗') }] : [] }));
  }
  function render() {
    const focusIndex = nodes.indexOf(document.activeElement);
    stage.replaceChildren();
    nodes = [];
    ui.classList.toggle('is-detail', detail);
    ui.querySelector('h1').textContent = detail ? groups[group][language()] : text('A few things in my orbit.', '我的一小片星空。');
    ui.querySelector('.space-bio').textContent = text('Year 2 · ROAS + AI\nEmbodied AI, vision, and robot learning.', '大二 · ROAS + AI\n具身智能、视觉与机器人学习。');
    ui.querySelector('[data-reading]').textContent = text('List view ↗', '列表阅读 ↗');
    ui.querySelector('[data-motion]').textContent = motion ? text('Pause motion', '暂停动画') : text('Resume motion', '恢复动画');
    ui.querySelector('[data-motion]').setAttribute('aria-pressed', String(!motion));
    ui.querySelector('[data-section="ventures"]').textContent = text('Ideas', '创业兴趣');
    ui.querySelector('[data-section="blog"]').textContent = text('Notes', '博客');
    ui.querySelector('[data-section="contact"]').textContent = text('Contact', '联系');
    ui.querySelector('[data-back]').hidden = !detail;
    ui.querySelector('[data-back]').textContent = '↶';
    ui.querySelector('[data-back]').setAttribute('aria-label', text('Back to constellations', '返回星群'));
    ui.querySelector('[data-prev]').setAttribute('aria-label', text('Previous', '上一个'));
    ui.querySelector('[data-next]').setAttribute('aria-label', text('Next', '下一个'));
    ui.querySelector('[data-open]').hidden = detail;
    ui.querySelector('[data-open]').textContent = text('Explore constellation', '展开这团星星');
    ui.querySelector('.space-help').textContent = detail ? text('SCROLL / ← →  browse · ESC  return · Scroll inside a card to read', '滚轮 / ← → 切换 · Esc 返回 · 在卡片内滚动阅读') : text('SCROLL / ← →  orbit · DOUBLE CLICK / ENTER  explore · Swipe on touchscreens', '滚轮 / ← → 切换星群 · 双击 / Enter 展开 · 手机左右滑动');
    returnButton.textContent = text('Return to 3D space', '返回 3D 星空');
    if (!detail) {
      groups.forEach((data, i) => {
        const button = el('button', '', 'star-label');
        button.append(el('span', `0${i + 1} / ${data.id.toUpperCase()}`, 'star-index'), el('strong', data[language()]), el('small', data.sub[language() === 'zh' ? 1 : 0]));
        button.addEventListener('click', () => { if (group !== i) { group = i; arrange(); } });
        button.addEventListener('dblclick', () => { if (group === i) open(); });
        button.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); group = i; open(); } });
        stage.append(button); nodes.push(button);
      });
    } else {
      contents().forEach((data, i) => {
        const card = el('article', '', 'space-card');
        card.tabIndex = -1;
        card.append(el('span', `${groups[group][language()]} / 0${i + 1}`, 'card-number'), el('h2', data.title));
        if (data.image) { const img = el('img'); img.src = data.image; img.alt = data.alt || data.title; img.loading = 'lazy'; card.append(img); }
        data.paragraphs.filter(Boolean).forEach(p => card.append(el('p', p)));
        data.links?.forEach(link => { const a = el('a', link.label); a.href = link.href; if (/^https:/.test(link.href)) { a.target = '_blank'; a.rel = 'noreferrer'; } card.append(a); });
        stage.append(card); nodes.push(card);
      });
    }
    arrange();
    if (focusIndex >= 0) nodes[Math.min(focusIndex, nodes.length - 1)]?.focus({ preventScroll: true });
  }
  function arrange() {
    const current = detail ? item : group;
    nodes.forEach((node, i) => {
      let delta = wrap(i - current, nodes.length);
      if (delta > nodes.length / 2) delta -= nodes.length;
      const center = delta === 0;
      node.classList.toggle('is-current', center);
      if (detail) {
        node.style.transform = `translate(-50%, -50%) translate3d(${delta * Math.min(w * .64, 540)}px, ${Math.abs(delta) * 32}px, ${-Math.abs(delta) * 300}px) rotateY(${-delta * 14}deg)`;
        node.style.opacity = center ? '1' : '.22';
        node.inert = !center;
        node.setAttribute('aria-hidden', String(!center));
      } else {
        node.style.transform = `translate3d(${delta * Math.min(w * .48, 480)}px, ${Math.abs(delta) * -35}px, ${-Math.abs(delta) * 320}px)`;
        node.style.opacity = center ? '1' : '.5';
        node.setAttribute('aria-current', String(center));
      }
    });
    ui.querySelector('.space-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(nodes.length).padStart(2, '0')}`;
  }
  function move(delta) { if (detail) item = wrap(item + delta, nodes.length); else group = wrap(group + delta, 4); arrange(); }
  function open() { detail = true; item = 0; render(); nodes[0]?.focus({ preventScroll: true }); }
  function back() { detail = false; render(); nodes[group]?.focus({ preventScroll: true }); }
  function reading(hash = '#about') {
    active = false; ui.hidden = true; document.body.classList.remove('spatial-mode');
    document.querySelectorAll('.reveal').forEach(node => node.classList.add('visible'));
    const target = document.querySelector(hash);
    target?.scrollIntoView({ behavior: 'instant' });
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    cancelAnimationFrame(frame);
  }
  function enter() { active = true; ui.hidden = false; document.body.classList.add('spatial-mode'); window.scrollTo(0,0); render(); resize(); cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); }
  ui.querySelector('[data-reading]').onclick = () => reading(`#${groups[group].id}`);
  ui.querySelector('[data-motion]').onclick = () => { motion = !motion; render(); };
  ui.querySelector('[data-prev]').onclick = () => move(-1);
  ui.querySelector('[data-next]').onclick = () => move(1);
  ui.querySelector('[data-open]').onclick = open;
  ui.querySelector('[data-back]').onclick = back;
  ui.querySelectorAll('[data-section]').forEach(button => { button.onclick = () => reading(`#${button.dataset.section}`); });
  returnButton.onclick = enter;
  document.addEventListener('keydown', event => {
    if (!active || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'Escape' && detail) { event.preventDefault(); back(); }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); move(['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1); }
    if (event.key === 'Enter' && !detail && (event.target === document.body || event.target === ui)) { event.preventDefault(); open(); }
  });
  ui.addEventListener('wheel', event => {
    if (event.target.closest('.space-card') && detail) return;
    event.preventDefault();
    if (performance.now() - wheelAt < 520 || Math.abs(event.deltaY) + Math.abs(event.deltaX) < 6) return;
    wheelAt = performance.now(); move((Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX) > 0 ? 1 : -1);
  }, { passive: false });
  let touchX = 0, touchY = 0;
  ui.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, { passive: true });
  ui.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - touchX; const dy = e.changedTouches[0].clientY - touchY; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1); }, { passive: true });
  ui.addEventListener('pointermove', e => { pointer = { x: e.clientX / w - .5, y: e.clientY / h - .5 }; });
  stage.addEventListener('dblclick', event => {
    if (detail || event.target.closest('button, a, article')) return;
    const x = event.clientX - w / 2;
    if (Math.abs(x) < Math.min(w * .25, 230)) open();
  });
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href^="#"]');
    if (!a || !active) return;
    const hash = a.getAttribute('href');
    const match = groups.findIndex(g => `#${g.id}` === hash);
    if (match >= 0) { event.preventDefault(); group = match; detail = false; open(); }
    else if (hash === '#top' || hash === '#main') { event.preventDefault(); back(); }
    else if (document.querySelector(hash)) { event.preventDefault(); reading(hash); }
  });
  new MutationObserver(() => render()).observe(root, { attributes: true, attributeFilter: ['lang'] });
  // A deterministic 3D point cloud: each category has its own silhouette.
  let seed = 73;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({ length: 640 }, () => ({ x: random(), y: random(), z: random(), size: random() }));
  const cloud = Array.from({ length: 260 }, (_, i) => { const angle = random() * Math.PI * 2, r = Math.pow(random(), .5), y = (random() - .5) * 2; return { x: Math.cos(angle) * r, y, z: Math.sin(angle) * r, size: random(), i }; });
  function resize() { w = ui.clientWidth; h = ui.clientHeight; const dpr = Math.min(devicePixelRatio || 1, 1.7); canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); arrange(); }
  function draw(time) {
    if (!active) return;
    const dt = Math.min((time - last) / 1000, .04); last = time;
    if (motion && !document.hidden) phase += dt * .12;
    shift += ((group - shift)) * (motion ? .075 : 1);
    expanded += ((detail ? 1 : 0) - expanded) * (motion ? .065 : 1);
    ctx.clearRect(0, 0, w, h);
    const dark = root.dataset.theme === 'dark';
    const rgb = dark ? '114,210,255' : '0,110,170';
    const fog = ctx.createRadialGradient(w*.5,h*.47,10,w*.5,h*.47,w*.55);
    fog.addColorStop(0, dark ? 'rgba(0,142,232,.15)' : 'rgba(95,208,255,.2)'); fog.addColorStop(1,'rgba(0,142,232,0)');
    ctx.fillStyle=fog; ctx.fillRect(0,0,w,h);
    for (const s of stars) {
      const x = (s.x * w + (motion ? pointer.x * s.z * 20 : 0) + w) % w;
      const y = (s.y * h + Math.sin(phase + s.x * 10) * 3 + h) % h;
      ctx.fillStyle = `rgba(${rgb},${.12 + s.z * .3})`; ctx.beginPath(); ctx.arc(x,y,.3 + s.size * .9,0,Math.PI*2); ctx.fill();
    }
    for (let g = 0; g < 4; g++) {
      let delta = g - shift; if (delta > 2) delta -= 4; if (delta < -2) delta += 4;
      const depth = 1 / (1 + Math.abs(delta) * .35);
      const cx = w*.5 + delta * Math.min(w*.48,480) * depth;
      const cy = h*.48 - 70 - Math.abs(delta)*20;
      const radius = Math.min(w*.22,170) * depth * (1 + expanded * 1.8);
      const alpha = Math.max(.05, 1 - Math.abs(delta)*.36) * (1 - expanded * .8);
      const projected = [];
      for (const s of cloud) {
        const a = phase + g*.7;
        let x = s.x, y = s.y, z = s.z;
        if (g===1) { y *= .35; x *= 1.35; }
        if (g===2) { y *= .8; x *= .7; z *= .5; }
        if (g===3) { x = Math.sign(x)*Math.pow(Math.abs(x),.4); y *= .65; }
        const rx = x*Math.cos(a) - z*Math.sin(a), rz = x*Math.sin(a) + z*Math.cos(a);
        const p = 2.8/(2.8+rz);
        const px = cx + rx*radius*p, py = cy + y*radius*.65*p;
        projected.push([px,py]);
        ctx.fillStyle=`rgba(${rgb},${alpha*(.25+s.size*.65)})`;
        ctx.beginPath(); ctx.arc(px,py,(.6+s.size*1.2)*p*depth,0,Math.PI*2); ctx.fill();
        if (s.i % 19===0) { ctx.fillStyle=`rgba(${rgb},${alpha*.09})`; ctx.beginPath();ctx.arc(px,py,9*depth,0,Math.PI*2);ctx.fill(); }
      }
      ctx.lineWidth=.5; ctx.strokeStyle=`rgba(${rgb},${alpha*.16})`;
      for(let i=0;i<projected.length-1;i+=3){ const a=projected[i],b=projected[i+1]; if(Math.hypot(a[0]-b[0],a[1]-b[1])<radius*.65){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();} }
    }
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  enter();
  if (location.hash && location.hash !== '#top' && location.hash !== '#main') reading(location.hash);
})();
