const root = document.documentElement;
const header = document.querySelector('[data-header]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const copyButton = document.querySelector('[data-copy-email]');
const copyLabel = document.querySelector('[data-copy-label]');
const toast = document.querySelector('[data-toast]');
const email = 'ytian515@connect.hkust-gz.edu.cn';
const languageToggle = document.querySelector('[data-language-toggle]');
const menuLabel = menuToggle.querySelector('.sr-only');

const translations = {
  en: {
    'site.title': 'Yifan Tian — Researcher & Builder',
    'site.description': 'Yifan Tian — HKUST(GZ) undergraduate researcher working on embodied AI, computer vision, and AI for healthcare.',
    'a11y.skip': 'Skip to content',
    'a11y.primaryNav': 'Primary navigation',
    'a11y.mobileNav': 'Mobile navigation',
    'a11y.openNav': 'Open navigation',
    'a11y.closeNav': 'Close navigation',
    'a11y.scrollAbout': 'Scroll to about section',
    'a11y.diagram': 'Abstract diagram connecting perception, reasoning, and action',
    'a11y.diagramTitle': 'Embodied intelligence system map',
    'a11y.diagramDesc': 'A dynamic network connecting perception, world models, and robot action.',
    'a11y.quickFacts': 'Quick facts',
    'a11y.blogTopics': 'Upcoming blog topics',
    'a11y.themeDark': 'Switch to dark theme',
    'a11y.themeLight': 'Switch to light theme',
    'a11y.languageZh': '切换到中文',
    'a11y.languageEn': 'Switch to English',
    'nav.about': 'About',
    'nav.research': 'Research',
    'nav.work': 'Work',
    'nav.projects': 'Projects',
    'nav.ventures': 'Ventures',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.talk': "Let's talk",
    'hero.meta': 'HKUST(GZ) · 2025 Undergraduate',
    'hero.title': 'I build intelligence<br>that can <em>see</em>, <em>reason</em>,<br>and <em>act</em>.',
    'hero.intro': "I'm Yifan Tian, an undergraduate researcher studying robotics and autonomous systems with AI. My work sits at the intersection of embodied perception, manipulation, and computer vision.",
    'hero.researchCta': 'Explore my research',
    'hero.diagram.label': 'EMBODIED SYSTEM / 01',
    'hero.diagram.perception': 'PERCEPTION',
    'hero.diagram.worldModel': 'WORLD MODEL',
    'hero.diagram.memory': 'MEMORY',
    'hero.diagram.action': 'ACTION',
    'hero.diagram.space': '3D SPACE',
    'hero.diagram.input': 'INPUT',
    'hero.diagram.inputValue': 'vision + geometry',
    'hero.diagram.output': 'OUTPUT',
    'hero.diagram.outputValue': 'grounded action',
    'hero.scroll': 'Scroll to discover',
    'section.about': '01 / ABOUT',
    'section.research': '02 / RESEARCH',
    'section.publications': '03 / PUBLICATIONS',
    'section.projects': '04 / PROJECTS',
    'section.ventures': '05 / VENTURES',
    'section.blog': '06 / BLOG',
    'section.contact': '07 / CONTACT',
    'about.title': 'Curiosity,<br>made concrete.',
    'about.lead': 'I am a 2025-cohort undergraduate at <strong>HKUST(GZ)</strong>, studying Robotics and Autonomous Systems (ROAS) alongside Artificial Intelligence.',
    'about.body1': 'I care about the bridge between what an intelligent system perceives and what it can reliably do next. That means building representations of real environments, reasoning about uncertainty, and turning visual understanding into physical action.',
    'about.body2': 'Alongside research, I enjoy turning ambitious ideas into working systems—from robot policy training to multi-agent simulation tools.',
    'about.locationLabel': 'Based in',
    'about.location': 'Guangzhou, China',
    'about.focusLabel': 'Current focus',
    'about.focus': 'Embodied intelligence',
    'about.approachLabel': 'Approach',
    'about.approach': 'Research × building',
    'research.title': 'Researching the loop<br>between <em>seeing</em> and <em>doing</em>.',
    'research.intro': 'My interests converge on machines that understand spatial environments and use that understanding to make safe, effective decisions.',
    'research.interest1.title': 'Embodied perception & manipulation',
    'research.interest1.body': '3D scene understanding, structured spatial representations, and perception-to-action grounding for robots operating in the physical world.',
    'research.interest1.tag': 'PRIMARY',
    'research.interest2.title': 'Computer vision',
    'research.interest2.body': 'Open-vocabulary recognition, multimodal visual reasoning, and robust representations that transfer beyond curated datasets.',
    'research.interest2.tag': 'FOUNDATION',
    'research.interest3.title': 'AI for healthcare',
    'research.interest3.body': 'Human-centered, evidence-aware AI systems that can support perception, analysis, and responsible clinical decision-making.',
    'research.interest3.tag': 'EMERGING',
    'research.experience.label': 'RESEARCH EXPERIENCE',
    'research.experience.title': 'Undergraduate research & collaboration',
    'research.experience.date': '2025 — PRESENT',
    'research.experience.body': 'Exploring reliable 3D scene understanding for embodied agents, with current work spanning uncertainty-aware scene graphs, retrieval-augmented semantics, and robot manipulation.',
    'publications.title': 'Selected papers.',
    'publications.intro': 'Early contributions to open, collaborative research in 3D perception and embodied intelligence.',
    'publications.rag.fields': 'Computer Vision · Robotics · AI',
    'publications.jitoma.authors': 'Yue Chang, Rufeng Chen, <strong>Yifan Tian</strong>, Dazhi Huang, Zhaofan Zhang, Yi Chen, Wenze Zhang, Li Chen, Hui Xiong, Sihong Xie',
    'publications.jitoma.fields': 'Robotics · 3D Scene Graphs · Long-Horizon Reasoning',
    'projects.title': 'Selected work.',
    'projects.intro': 'Experiments in spatial intelligence, robot learning, and multi-agent systems—built to move ideas beyond the page.',
    'projects.sg.tag': 'EMBODIED AI · 3DSG',
    'projects.sg.scene': 'scene',
    'projects.sg.object': 'object',
    'projects.sg.relation': 'relation',
    'projects.sg.action': 'action',
    'projects.sg.body': 'A specialized agent exploring how structured 3D scene graphs can support grounded reasoning for embodied systems.',
    'projects.g1.tag': 'ROBOT LEARNING · POLICY',
    'projects.g1.body': 'Data-driven action-policy training experiments for the Unitree G1 humanoid platform.',
    'projects.gold.tag': 'MULTI-AGENT · EXPLORATION',
    'projects.gold.fork': 'FORK',
    'projects.gold.body': 'Exploration of a multi-agent simulation engine combining GraphRAG, role-based agents, and scenario forecasting.',
    'projects.gkguard.tag': 'ROBOTICS · ROS 2 · HARDWARE',
    'projects.gkguard.status': 'IN DEVELOPMENT',
    'projects.gkguard.body': 'A ROS 2 four-wheel mobile robot project integrating dual hoverboard motor controllers through ros2_control, with serial motor control and an IMU-ready localization path.',
    'projects.all': 'View all repositories',
    'ventures.title': 'Ideas worth<br>building for.',
    'ventures.intro': "I'm interested in research-led ventures where technical depth can unlock practical, defensible products.",
    'ventures.item1.title': 'Physical AI systems',
    'ventures.item1.body': 'Perception and decision infrastructure for robots working in unstructured, high-value environments.',
    'ventures.item2.title': 'AI-native scientific tools',
    'ventures.item2.body': 'Systems that make complex visual evidence, simulation, and research workflows more legible and useful.',
    'ventures.item3.title': 'Responsible healthcare AI',
    'ventures.item3.body': 'Assistive products that keep clinical context, safety, and human oversight at the center of deployment.',
    'blog.title': 'Field notes.',
    'blog.intro': 'Writing in progress—on embodied perception, research practice, and building systems that leave the lab.',
    'blog.status': 'First posts coming soon',
    'blog.topic1': '3D scene graphs',
    'blog.topic2': 'Embodied world models',
    'blog.topic3': 'Robot manipulation',
    'blog.topic4': 'Research notes',
    'blog.topic5': 'AI × healthcare',
    'blog.emptyTitle': 'The notebook is open.',
    'blog.emptyBody': 'Essays, reading notes, and project breakdowns will live here.',
    'contact.title': 'Have a difficult idea?<br><em>Let\'s make it real.</em>',
    'contact.intro': "I'm open to research conversations, technical collaborations, and ambitious early-stage projects across embodied AI, computer vision, and healthcare.",
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.quick': 'Quick action',
    'contact.copy': 'Copy email address',
    'contact.copied': 'Copied',
    'contact.toast': 'Email copied to clipboard',
    'footer.tagline': 'Researching intelligence that acts in the world.',
    'footer.top': 'Back to top ↑'
  },
  zh: {
    'site.title': 'Yifan Tian — 具身智能研究者与构建者',
    'site.description': 'Yifan Tian，香港科技大学（广州）本科生，研究方向包括具身智能、计算机视觉与医疗人工智能。',
    'a11y.skip': '跳到主要内容',
    'a11y.primaryNav': '主导航',
    'a11y.mobileNav': '移动端导航',
    'a11y.openNav': '打开导航',
    'a11y.closeNav': '关闭导航',
    'a11y.scrollAbout': '滚动到个人简介',
    'a11y.diagram': '连接感知、推理与行动的抽象系统图',
    'a11y.diagramTitle': '具身智能系统图',
    'a11y.diagramDesc': '连接感知、世界模型、记忆与机器人行动的动态网络。',
    'a11y.quickFacts': '个人信息摘要',
    'a11y.blogTopics': '即将发布的博客主题',
    'a11y.themeDark': '切换到深色模式',
    'a11y.themeLight': '切换到浅色模式',
    'a11y.languageZh': '切换到中文',
    'a11y.languageEn': '切换到英文',
    'nav.about': '简介',
    'nav.research': '科研',
    'nav.work': '项目',
    'nav.projects': '项目',
    'nav.ventures': '方向',
    'nav.blog': '博客',
    'nav.contact': '联系',
    'nav.talk': '联系我',
    'hero.meta': '香港科技大学（广州）· 2025级本科生',
    'hero.title': '我构建能够<br><em>看见</em>、<em>思考</em>，<br>并付诸<em>行动</em>的<br>智能系统。',
    'hero.intro': '我是 Yifan Tian，一名主修机器人与自主系统（ROAS）和人工智能的本科研究者。我的工作聚焦于具身感知、机器人操作与计算机视觉的交叉地带。',
    'hero.researchCta': '了解我的科研',
    'hero.diagram.label': '具身系统 / 01',
    'hero.diagram.perception': '感知',
    'hero.diagram.worldModel': '世界模型',
    'hero.diagram.memory': '记忆',
    'hero.diagram.action': '行动',
    'hero.diagram.space': '三维空间',
    'hero.diagram.input': '输入',
    'hero.diagram.inputValue': '视觉 + 几何',
    'hero.diagram.output': '输出',
    'hero.diagram.outputValue': '落地行动',
    'hero.scroll': '继续探索',
    'section.about': '01 / 个人简介',
    'section.research': '02 / 科研方向',
    'section.publications': '03 / 学术论文',
    'section.projects': '04 / 项目经历',
    'section.ventures': '05 / 创业方向',
    'section.blog': '06 / 我的博客',
    'section.contact': '07 / 联系方式',
    'about.title': '让好奇心，<br>落到实处。',
    'about.lead': '我是<strong>香港科技大学（广州）</strong>2025级本科生，主修机器人与自主系统（ROAS）和人工智能。',
    'about.body1': '我关注智能系统“感知到什么”与“接下来能可靠完成什么”之间的桥梁：构建真实环境的结构化表征，在不确定性下进行推理，并把视觉理解转化为物理行动。',
    'about.body2': '科研之外，我也热衷于把有挑战的想法做成能运行的系统——从机器人策略训练到多智能体仿真工具。',
    'about.locationLabel': '所在地',
    'about.location': '中国 · 广州',
    'about.focusLabel': '当前聚焦',
    'about.focus': '具身智能',
    'about.approachLabel': '工作方式',
    'about.approach': '科研 × 构建',
    'research.title': '探索从<em>看见</em><br>到<em>行动</em>的闭环。',
    'research.intro': '我的研究兴趣汇聚于能够理解空间环境，并利用这种理解做出安全、有效决策的智能机器。',
    'research.interest1.title': '具身感知与机器人操作',
    'research.interest1.body': '面向真实世界机器人的三维场景理解、结构化空间表征，以及从感知到行动的可靠落地。',
    'research.interest1.tag': '核心方向',
    'research.interest2.title': '计算机视觉',
    'research.interest2.body': '开放词汇识别、多模态视觉推理，以及能够超越精心整理数据集、迁移到真实场景的鲁棒表征。',
    'research.interest2.tag': '基础方向',
    'research.interest3.title': '医疗人工智能',
    'research.interest3.body': '以人为中心、重视证据的人工智能系统，用于支持医学感知、分析与负责任的临床决策。',
    'research.interest3.tag': '拓展方向',
    'research.experience.label': '科研经历',
    'research.experience.title': '本科科研与协作',
    'research.experience.date': '2025 — 至今',
    'research.experience.body': '研究面向具身智能体的可靠三维场景理解，目前涉及不确定性感知场景图、检索增强语义与机器人操作。',
    'publications.title': '代表论文。',
    'publications.intro': '在三维感知与具身智能方向参与开放、协作式研究。',
    'publications.rag.fields': '计算机视觉 · 机器人 · 人工智能',
    'publications.jitoma.authors': 'Yue Chang, Rufeng Chen, <strong>Yifan Tian</strong>, Dazhi Huang, Zhaofan Zhang, Yi Chen, Wenze Zhang, Li Chen, Hui Xiong, Sihong Xie',
    'publications.jitoma.fields': '机器人 · 三维场景图 · 长时程推理',
    'projects.title': '代表项目。',
    'projects.intro': '围绕空间智能、机器人学习与多智能体系统展开实验，让想法不止停留在纸面。',
    'projects.sg.tag': '具身智能 · 3DSG',
    'projects.sg.scene': '场景',
    'projects.sg.object': '物体',
    'projects.sg.relation': '关系',
    'projects.sg.action': '行动',
    'projects.sg.body': '探索如何利用结构化三维场景图，为具身智能系统提供基于真实环境的可靠推理能力。',
    'projects.g1.tag': '机器人学习 · 策略',
    'projects.g1.body': '面向 Unitree G1 人形机器人平台的数据驱动动作策略训练实验。',
    'projects.gold.tag': '多智能体 · 探索项目',
    'projects.gold.fork': '派生仓库',
    'projects.gold.body': '探索融合 GraphRAG、角色智能体与情景预测的多智能体仿真引擎。',
    'projects.gkguard.tag': '机器人 · ROS 2 · 硬件',
    'projects.gkguard.status': '开发中',
    'projects.gkguard.body': '一个基于 ROS 2 与 ros2_control 的四轮移动机器人项目，整合前后双悬浮车电机控制器，并预留 IMU 融合定位链路。',
    'projects.all': '查看全部 GitHub 仓库',
    'ventures.title': '值得投入的<br>方向。',
    'ventures.intro': '我对研究驱动的创业项目感兴趣，希望用足够深入的技术构建真正实用、具有壁垒的产品。',
    'ventures.item1.title': '物理世界人工智能',
    'ventures.item1.body': '为机器人在非结构化、高价值环境中工作提供感知与决策基础设施。',
    'ventures.item2.title': 'AI 原生科研工具',
    'ventures.item2.body': '让复杂视觉证据、仿真过程与科研工作流变得更清晰、更易用。',
    'ventures.item3.title': '负责任的医疗 AI',
    'ventures.item3.body': '把临床语境、安全边界与人类监督置于部署核心的辅助型产品。',
    'blog.title': '研究随笔。',
    'blog.intro': '正在写作——关于具身感知、科研实践，以及如何让系统真正走出实验室。',
    'blog.status': '首批文章即将发布',
    'blog.topic1': '三维场景图',
    'blog.topic2': '具身世界模型',
    'blog.topic3': '机器人操作',
    'blog.topic4': '科研笔记',
    'blog.topic5': 'AI × 医疗',
    'blog.emptyTitle': '笔记本已经打开。',
    'blog.emptyBody': '这里将发布长文、论文阅读笔记与项目拆解。',
    'contact.title': '有个棘手的想法？<br><em>一起把它做成现实。</em>',
    'contact.intro': '欢迎就具身智能、计算机视觉和医疗人工智能展开科研交流、技术合作或早期项目探索。',
    'contact.email': '邮箱',
    'contact.phone': '电话',
    'contact.quick': '快捷操作',
    'contact.copy': '复制邮箱地址',
    'contact.copied': '已复制',
    'contact.toast': '邮箱地址已复制',
    'footer.tagline': '研究能够在真实世界中行动的智能。',
    'footer.top': '返回顶部 ↑'
  }
};

let currentLanguage = 'en';

const translate = (key) => translations[currentLanguage][key] || translations.en[key] || key;

const updateThemeLabel = () => {
  themeToggle.setAttribute('aria-label', translate(root.dataset.theme === 'dark' ? 'a11y.themeLight' : 'a11y.themeDark'));
};

const updateMenuLabel = () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuLabel.textContent = translate(isOpen ? 'a11y.closeNav' : 'a11y.openNav');
};

const applyLanguage = (language, persist = true) => {
  currentLanguage = language === 'zh' ? 'zh' : 'en';
  root.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
  document.title = translate('site.title');
  document.querySelector('meta[name="description"]').setAttribute('content', translate('site.description'));
  document.querySelector('meta[property="og:title"]').setAttribute('content', translate('site.title'));
  document.querySelector('meta[property="og:description"]').setAttribute('content', translate('site.description'));

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = translations[currentLanguage][element.dataset.i18n];
    if (value) element.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = translations[currentLanguage][element.dataset.i18nAriaLabel];
    if (value) element.setAttribute('aria-label', value);
  });

  languageToggle.querySelectorAll('[data-language-option]').forEach((option) => {
    option.classList.toggle('active', option.dataset.languageOption === currentLanguage);
  });
  languageToggle.setAttribute('aria-pressed', String(currentLanguage === 'zh'));
  languageToggle.setAttribute('aria-label', translate(currentLanguage === 'en' ? 'a11y.languageZh' : 'a11y.languageEn'));
  updateThemeLabel();
  updateMenuLabel();
  if (persist) localStorage.setItem('language', currentLanguage);
};

const storedTheme = localStorage.getItem('theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = storedTheme || preferredTheme;
const storedLanguage = localStorage.getItem('language');
const preferredLanguage = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
const initialLanguage = storedLanguage || preferredLanguage;
root.dataset.theme = initialTheme;
applyLanguage(initialLanguage, false);

languageToggle.addEventListener('click', () => {
  applyLanguage(currentLanguage === 'en' ? 'zh' : 'en');
});

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
  updateThemeLabel();
  document.querySelector('meta[name="theme-color"]').setAttribute('content', nextTheme === 'dark' ? '#0d1016' : '#f4f3ef');
});

const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
  updateMenuLabel();
};

menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  mobileNav.hidden = !willOpen;
  document.body.classList.toggle('menu-open', willOpen);
  updateMenuLabel();
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 1040) closeMenu(); });

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
}, { rootMargin: '-30% 0px -55%', threshold: [0, .2, .5] });
sections.forEach((section) => sectionObserver.observe(section));

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const input = document.createElement('textarea');
    input.value = email;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  copyLabel.textContent = translate('contact.copied');
  toast.classList.add('visible');
  window.setTimeout(() => {
    copyLabel.textContent = translate('contact.copy');
    toast.classList.remove('visible');
  }, 2200);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
window.__i18n = { applyLanguage, get language() { return currentLanguage; }, translations };
