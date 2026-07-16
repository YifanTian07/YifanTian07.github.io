const styles = [
  'Kinetic Paper',
  'Electric Blue',
  'Neo Swiss',
  'Midnight Orbit',
  'Citrus Canvas',
  'Terminal Bloom',
  'Lavender Studio',
  'Ocean Glass',
  'Redline Zine',
  'Soft Robotics',
];

const clampStyle = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= styles.length ? parsed : 1;
};

const params = new URLSearchParams(window.location.search);
const styleNumber = clampStyle(params.get('style'));

if (document.body.classList.contains('preview-page')) {
  document.body.dataset.style = String(styleNumber);
  document.querySelectorAll('[data-style-number]').forEach((node) => {
    node.textContent = String(styleNumber).padStart(2, '0');
  });
  document.querySelectorAll('[data-style-name]').forEach((node) => {
    node.textContent = styles[styleNumber - 1];
  });
  document.querySelector('[data-prev-style]').href = `preview.html?style=${styleNumber === 1 ? styles.length : styleNumber - 1}`;
  document.querySelector('[data-next-style]').href = `preview.html?style=${styleNumber === styles.length ? 1 : styleNumber + 1}`;
  document.title = `${String(styleNumber).padStart(2, '0')} ${styles[styleNumber - 1]} — Yifan Tian`;
}

let language = localStorage.getItem('style-lab-language') || (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

const applyLanguage = (nextLanguage) => {
  language = nextLanguage === 'zh' ? 'zh' : 'en';
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en][data-zh]').forEach((node) => {
    node.textContent = node.dataset[language];
  });
  document.querySelectorAll('[data-language-toggle]').forEach((button) => {
    button.classList.toggle('is-zh', language === 'zh');
    button.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  });
  localStorage.setItem('style-lab-language', language);
};

document.querySelectorAll('[data-language-toggle]').forEach((button) => {
  button.addEventListener('click', () => applyLanguage(language === 'en' ? 'zh' : 'en'));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

applyLanguage(language);
