// The semantic homepage remains visible until WebGL is ready.
(async () => {
  'use strict';
  const root=document.documentElement;
  const text=(en,zh)=>root.lang.startsWith('zh')?zh:en;
  const clean=node=>node?.textContent.trim()||'';
  const make=(tag,value='',className='')=>{const n=document.createElement(tag);n.textContent=value;n.className=className;return n;};
  const groups=[{id:'about',en:'About me',zh:'个人简介'},{id:'research',en:'Research',zh:'研究兴趣'},{id:'publications',en:'Papers',zh:'论文发表'},{id:'work',en:'Projects',zh:'项目经历'}];
  const title=g=>text(g.en,g.zh);
  const ui=make('section','','universe');ui.hidden=true;
  ui.setAttribute('aria-label',text('Interactive 3D portfolio','交互式三维主页'));
  ui.innerHTML=`<div class="galaxy-wash" aria-hidden="true"></div>
    <div class="space-heading"><p>YIFAN TIAN <span>/</span> HKUST(GZ)</p><h1></h1><p class="space-bio"></p><p class="space-hint"></p></div>
    <div class="space-tools"><button data-reading></button><button data-motion></button></div>
    <nav class="space-links" aria-label="More"><button data-section="ventures"></button><button data-section="blog"></button><button data-section="contact"></button></nav>
    <div class="space-labels"></div><aside class="planet-note" hidden aria-live="polite"></aside>
    <span class="space-status sr-only" role="status"></span>`;
  document.body.append(ui);
  const returnButton=make('button','','space-mode-return');returnButton.hidden=true;document.body.append(returnButton);
  let engine,palettes;
  let active=true,detail=false,group=0,selected=-1,labels=[],entries=[],gesture=null,lastTap=null;
  let dragDistance=0,pinch=0;const pointers=new Map();
  const note=ui.querySelector('.planet-note');
  try {
    const module=await import('./galaxy-engine.js?v=20260905d');palettes=module.palettes;ui.hidden=false;
    engine=new module.GalaxyEngine(ui,positionLabels,()=>reading('#about'));
  } catch(error) {
    console.warn('3D navigation unavailable; using the reading view.',error.message);
    ui.remove();returnButton.remove();return;
  }
  function contents() {
    if(group===0)return [
      {title:'Yifan Tian',theme:0,palette:palettes[0],paragraphs:[text('Year 2 · HKUST(GZ) · ROAS + AI · Class of 2025','大二 · 香港科技大学（广州）· ROAS + AI · 2025 级'),clean(document.querySelector('[data-i18n="about.body1"]'))]},
      {title:text('Research & building','科研与实践'),theme:1,palette:palettes[1],paragraphs:[clean(document.querySelector('[data-i18n="about.body2"]'))],links:[{href:'#research',label:text('Explore research','查看研究兴趣')}]},
      {title:text('Get in touch','联系我'),theme:0,palette:palettes[2],paragraphs:[text('Guangzhou, China. Open to research and project collaborations.','常驻广州，欢迎交流研究问题与项目合作。')],links:[{href:'mailto:ytian515@connect.hkust-gz.edu.cn',label:'ytian515@connect.hkust-gz.edu.cn'},{href:'tel:+8618401250620',label:'+86 184 0125 0620'},{href:'https://github.com/YifanTian07',label:'GitHub ↗'}]}
    ];
    if(group===1)return [...document.querySelectorAll('.interest-item')].map((node,i)=>({title:clean(node.querySelector('h3')),paragraphs:[...node.querySelectorAll('p')].map(clean),theme:[3,1,4][i],palette:[palettes[1],palettes[2],palettes[4]][i]}));
    if(group===2)return [...document.querySelectorAll('.publication')].map((node,i)=>({title:clean(node.querySelector('h3')),short:i?'JITOMA':'RAG-3DSG',paragraphs:[...node.querySelectorAll('.publication-main p')].map(clean),image:node.querySelector('img')?.getAttribute('src'),alt:node.querySelector('img')?.alt,theme:2,palette:palettes[i?2:1],links:[...node.querySelectorAll('.circle-link')].map(a=>({href:a.getAttribute('href'),label:text('Read on arXiv ↗','在 arXiv 阅读 ↗')}))}));
    return [...document.querySelectorAll('.project-grid > .project')].map((node,i)=>({title:clean(node.querySelector('h3')),short:i===1?'Unitree G1':clean(node.querySelector('h3')),paragraphs:[clean(node.querySelector('.project-copy p'))],theme:[2,3,2,3][i],palette:[palettes[1],palettes[3],palettes[2],palettes[0]][i],links:node.tagName==='A'?[{href:node.getAttribute('href'),label:text('Explore project ↗','查看项目 ↗')}]:[]}));
  }
  function updateCopy() {
    ui.querySelector('h1').textContent=detail?title(groups[group]):'Yifan Tian';
    ui.querySelector('.space-bio').textContent=detail?text('Choose a world. Follow an idea.','一颗星球，一个正在探索的方向。'):text('Year 2 · ROAS + AI\nPerception, manipulation & embodied intelligence.','大二 · ROAS + AI\n具身感知、机器人操作与智能系统。');
    ui.querySelector('.space-hint').textContent=detail?text('DRAG ANYWHERE TO ORBIT · TAP A PLANET · FLICK UP / ESC TO LEAVE','全屏拖动探索 · 点击星球阅读 · 快速上划 / Esc 返回'):text('DRAG TO EXPLORE · DOUBLE CLICK A GALAXY · ↑ ↓ ← →','全屏自由拖动 · 双击星团进入 · ↑ ↓ ← →');
    ui.querySelector('[data-reading]').textContent=text('Reading view','列表阅读');
    ui.querySelector('[data-motion]').textContent=engine.motion?text('Pause motion','暂停动态'):text('Resume motion','恢复动态');
    ui.querySelector('[data-motion]').setAttribute('aria-pressed',String(!engine.motion));
    ['ventures','blog','contact'].forEach((id,i)=>ui.querySelector(`[data-section="${id}"]`).textContent=text(['Ideas','Notes','Contact'][i],['创业兴趣','博客','联系'][i]));
    returnButton.textContent=text('Return to the stars','返回星空');
    if(detail)entries=contents();
    labels.forEach((label,i)=>{label.querySelector('strong').textContent=detail?(entries[i].short||entries[i].title):title(groups[i]);label.querySelector('small').textContent=detail?text('EXPLORE','探索'):['01 / ABOUT','02 / RESEARCH','03 / PAPERS','04 / PROJECTS'][i];});
    if(selected>=0&&detail)showNote(selected,false);
  }
  function build() {
    note.hidden=true;selected=-1;labels=[];
    ui.dataset.level=detail?'planets':'galaxies';
    ui.dataset.group=detail?groups[group].id:'overview';
    ui.style.setProperty('--space-hue',detail?palettes[group].secondary:'#0a2738');
    ui.querySelector('.space-labels').replaceChildren();
    entries=detail?contents():groups.map((g,i)=>({title:title(g),palette:palettes[i]}));
    engine.setBodies(entries,detail,detail?palettes[group]:null);
    entries.forEach((entry,i)=>{
      const label=make('button','','celestial-label');label.dataset.index=i;
      label.style.setProperty('--star-color',entry.palette.color);
      label.append(make('small'),make('strong'));
      label.addEventListener('click',()=>{detail?showNote(i):engine.focus(i);});
      label.addEventListener('dblclick',event=>{event.stopPropagation();if(!detail)open(i);});
      label.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();detail?showNote(i):open(i);}});
      label.addEventListener('focus',()=>{if(label.matches(':focus-visible'))engine.focus(i);});
      labels.push(label);ui.querySelector('.space-labels').append(label);
    });
    updateCopy();
    ui.querySelector('.space-status').textContent=detail?`${title(groups[group])}: ${entries.length} ${text('planets','颗星球')}`:text('Four galaxies. Use arrow keys to explore.','四个星团，使用方向键探索。');
  }
  function open(index) {group=index;detail=true;build();}
  function back() {if(!detail)return;detail=false;build();engine.focus(group);labels[group]?.focus({preventScroll:true});}
  function showNote(index,focus=true) {
    selected=index;const data=entries[index];note.replaceChildren();note.hidden=false;
    note.style.setProperty('--planet-color',data.palette.color);note.style.setProperty('--planet-dark',data.palette.dark);
    note.append(make('p',`${title(groups[group])} / ${String(index+1).padStart(2,'0')}`,'note-kicker'),make('h2',data.title));
    if(data.image){const a=make('a');a.href=data.image;a.target='_blank';a.rel='noreferrer';a.setAttribute('aria-label',text('Open full-size paper figure','打开论文主图'));const img=make('img');img.src=data.image;img.alt=data.alt||data.title;a.append(img);note.append(a);}
    data.paragraphs.filter(Boolean).forEach(p=>note.append(make('p',p)));
    data.links?.forEach(link=>{const a=make('a',link.label,'note-link');a.href=link.href;if(link.href.startsWith('https:')){a.target='_blank';a.rel='noreferrer';}note.append(a);});
    labels.forEach((l,i)=>l.setAttribute('aria-expanded',String(i===index)));
    if(focus)engine.focus(index);
  }
  function positionLabels(bodies) {
    bodies.forEach((body,i)=>{
      const label=labels[i];if(!label)return;const p=body.screen;
      label.style.left=`${p.x}px`;label.style.top=`${p.y+p.r*.73+13}px`;
      label.style.opacity=p.visible?String(Math.max(.35,Math.min(1,.65+p.depth*.045))):'0';
      label.style.visibility=p.visible?'visible':'hidden';label.style.zIndex=String(Math.round(p.depth+12));
    });
    if(detail&&selected>=0&&!note.hidden){
      const p=bodies[selected].screen;
      if(engine.width<700){note.style.left='18px';note.style.top='auto';note.style.bottom='20px';}
      else {const width=340;let x=p.x+p.r+32;if(x+width>engine.width-30)x=p.x-p.r-width-32;
        note.style.left=`${Math.max(24,Math.min(engine.width-width-24,x))}px`;
        note.style.top=`${Math.max(170,Math.min(engine.height-note.offsetHeight-30,p.y-note.offsetHeight*.4))}px`;note.style.bottom='auto';}
    }
  }
  function reading(hash='#about') {
    active=false;engine?.stop();ui.hidden=true;document.body.classList.remove('spatial-mode');returnButton.hidden=false;
    document.querySelectorAll('.reveal').forEach(n=>n.classList.add('visible'));
    const target=document.querySelector(hash);target?.scrollIntoView({behavior:'instant'});if(target){target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  function enter() {active=true;ui.hidden=false;returnButton.hidden=true;document.body.classList.add('spatial-mode');engine.resize();engine.start();}
  ui.querySelector('[data-reading]').onclick=()=>reading(`#${groups[group].id}`);
  ui.querySelector('[data-motion]').onclick=()=>{engine.motion=!engine.motion;updateCopy();};
  ui.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>reading(`#${button.dataset.section}`));
  returnButton.onclick=enter;
  const interactive=target=>target.closest('.planet-note,.space-tools,.space-links');
  ui.addEventListener('pointerdown',event=>{
    if(interactive(event.target)||event.target.closest('.celestial-label')||event.button>0)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);gesture=null;return;}
    dragDistance=0;gesture={x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,time:performance.now(),id:event.pointerId};
    ui.setPointerCapture(event.pointerId);ui.classList.add('is-dragging');
  });
  ui.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);engine.zoom=Math.max(17,Math.min(36,engine.zoom-(d-pinch)*.04));pinch=d;return;}
    if(!gesture)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    dragDistance+=Math.hypot(dx,dy);engine.rotate(dx,dy);gesture.x=event.clientX;gesture.y=event.clientY;
    if(dragDistance>8&&selected>=0){selected=-1;note.hidden=true;}
  });
  ui.addEventListener('pointerup',event=>{
    pointers.delete(event.pointerId);ui.classList.remove('is-dragging');
    if(!gesture)return;
    const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY,elapsed=performance.now()-gesture.time;
    if(detail&&dy<-110&&Math.abs(dy)>Math.abs(dx)*1.6&&elapsed<420){back();gesture=null;return;}
    if(dragDistance<8&&!interactive(event.target)){
      const rect=ui.getBoundingClientRect(),index=engine.hit(event.clientX-rect.left,event.clientY-rect.top);
      if(index>=0){
        if(detail)showNote(index);
        else if(lastTap&&lastTap.index===index&&performance.now()-lastTap.time<380){lastTap=null;open(index);}
        else {lastTap={index,time:performance.now()};}
      } else if(detail) {selected=-1;note.hidden=true;}
    }
    gesture=null;
  });
  ui.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);gesture=null;ui.classList.remove('is-dragging');});
  ui.addEventListener('dblclick',event=>{if(detail||interactive(event.target))return;const rect=ui.getBoundingClientRect();const i=engine.hit(event.clientX-rect.left,event.clientY-rect.top);if(i>=0)open(i);});
  ui.addEventListener('wheel',event=>{
    if(interactive(event.target))return;event.preventDefault();
    if(event.ctrlKey){engine.zoom=Math.max(17,Math.min(36,engine.zoom+event.deltaY*.03));}
    else engine.rotate(-event.deltaX*.55,-event.deltaY*.45);
    if(selected>=0){selected=-1;note.hidden=true;}
  },{passive:false});
  document.addEventListener('keydown',event=>{
    if(!active||event.altKey||event.ctrlKey||event.metaKey||/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;
    if(event.key==='Escape'){event.preventDefault();back();return;}
    const movement={ArrowLeft:[-65,0],ArrowRight:[65,0],ArrowUp:[0,-65],ArrowDown:[0,65]}[event.key];
    if(movement){event.preventDefault();engine.rotate(...movement);selected=-1;note.hidden=true;}
    if(event.key==='Enter'&&event.target===document.body){event.preventDefault();const center=engine.bodies.map((b,i)=>({i,d:Math.hypot(b.screen.x-engine.width/2,b.screen.y-engine.height/2)})).sort((a,b)=>a.d-b.d)[0].i;detail?showNote(center):open(center);}
  });
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href^="#"]');if(!a||!active)return;const hash=a.getAttribute('href');const index=groups.findIndex(g=>`#${g.id}`===hash);
    if(index>=0){event.preventDefault();open(index);}
    else if(hash==='#top'||hash==='#main'){event.preventDefault();back();}
    else if(hash.length>1&&document.querySelector(hash)){event.preventDefault();reading(hash);}
  });
  new MutationObserver(updateCopy).observe(root,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('resize',()=>engine.resize());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)engine.stop();else if(active)engine.start();});
  build();enter();
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#main')reading(location.hash);
})();
