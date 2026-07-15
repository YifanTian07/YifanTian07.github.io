const root = document.documentElement;
const header = document.querySelector('[data-header]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const copyButton = document.querySelector('[data-copy-email]');
const copyLabel = document.querySelector('[data-copy-label]');
const toast = document.querySelector('[data-toast]');
const email = 'ytian515@connect.hkust-gz.edu.cn';

const storedTheme = localStorage.getItem('theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = storedTheme || preferredTheme;
root.dataset.theme = initialTheme;
themeToggle.setAttribute('aria-label', initialTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
  themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', nextTheme === 'dark' ? '#0d1016' : '#f4f3ef');
});

const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
};

menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  mobileNav.hidden = !willOpen;
  document.body.classList.toggle('menu-open', willOpen);
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
  copyLabel.textContent = 'Copied';
  toast.classList.add('visible');
  window.setTimeout(() => {
    copyLabel.textContent = 'Copy email address';
    toast.classList.remove('visible');
  }, 2200);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
