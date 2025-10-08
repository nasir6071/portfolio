/* =========================
   setup / utilities
   ========================= */
document.body.classList.remove('menu-open');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const headerH = () =>
  parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 72;

const mobileMenu = $('#mobileMenu');
if (mobileMenu && !mobileMenu.hasAttribute('hidden')) mobileMenu.setAttribute('hidden', '');

/* year in footer */
const y = $('#year');
if (y) y.textContent = new Date().getFullYear();

/* =========================
   theme (desktop + mobile)
   ========================= */
const themeBtn = $('#themeBtn');
const themeBtnMobile = $('#themeBtnMobile');

const applyTheme = (t) =>
  t === 'light' ? root.classList.add('light') : root.classList.remove('light');
const setThemeIcon = (btn) => btn && (btn.textContent = root.classList.contains('light') ? '☾' : '☀︎');

applyTheme(localStorage.getItem('theme') || 'dark');
setThemeIcon(themeBtn);
setThemeIcon(themeBtnMobile);

const flipTheme = () => {
  const next = root.classList.contains('light') ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
  setThemeIcon(themeBtn);
  setThemeIcon(themeBtnMobile);
};
themeBtn?.addEventListener('click', flipTheme);
themeBtnMobile?.addEventListener('click', flipTheme);

/* =========================
   drawer (mobile)
   ========================= */
const menuBtn = $('#menuBtn');
const openDrawer = () => {
  document.body.classList.add('menu-open');
  menuBtn?.setAttribute('aria-expanded', 'true');
  mobileMenu?.removeAttribute('hidden');
};
const closeDrawer = () => {
  document.body.classList.remove('menu-open');
  menuBtn?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('hidden', '');
};

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () =>
    document.body.classList.contains('menu-open') ? closeDrawer() : openDrawer()
  );

  // click outside closes
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) closeDrawer();
  });

  // auto-close when leaving mobile width
  const mq = matchMedia('(max-width: 820px)');
  mq.addEventListener('change', (e) => {
    if (!e.matches) closeDrawer();
  });
}

/* =========================
   offset scrolling for #links
   ========================= */
const navAnchors = [
  ...$$('header a[href^="#"]'),
  ...$$('#mobileMenu a[href^="#"]')
];

function setActive(id) {
  const all = $$('header a[href^="#"], #mobileMenu a[href^="#"]');
  all.forEach((a) => {
    const hash = (a.getAttribute('href') || '').slice(1);
    a.classList.toggle('active', hash === id);
  });
}

function scrollToWithOffset(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = headerH() + 12;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

navAnchors.forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = (a.getAttribute('href') || '').slice(1);
    if (!id) return;
    e.preventDefault();
    closeDrawer();
    setActive(id);           // instant feedback
    scrollToWithOffset(id);  // correct landing
  });
});

/* If page loads with a hash, align it once layout is ready */
window.addEventListener('load', () => {
  const id = (location.hash || '#about').slice(1);
  if (!location.hash) setActive('about'); // first open = Home
  setTimeout(() => scrollToWithOffset(id), 0);
});

/* =========================
   ScrollSpy (math-based, stable)
   ========================= */
const sections = $$('section[id]');

let ticking = false;
function computeActiveSection() {
  const readLine = window.scrollY + headerH() + 14; // just below the header
  // find the LAST section whose top is above the readLine
  let current = sections[0]?.id || 'about';
  for (const s of sections) {
    const top = s.offsetTop;
    if (top <= readLine) current = s.id;
    else break; // sections are in order; stop early
  }
  setActive(current);
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(computeActiveSection);
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

/* also recalc on hashchange (e.g., browser back/forward) */
window.addEventListener('hashchange', () => {
  const id = (location.hash || '#about').slice(1);
  setActive(id);
  setTimeout(() => scrollToWithOffset(id), 0);
});

/* =========================
   Back to top
   ========================= */
$('#toTop')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =========================
   Contact form (mailto)
   ========================= */
const cf = $('#contactForm');
if (cf) {
  cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cfName').value.trim();
    const email = $('#cfEmail').value.trim();
    const subject = $('#cfSubject').value.trim() || 'Portfolio contact';
    const message = $('#cfMessage').value.trim();

    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:mdnasiruddin6071@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${body}`;
    window.location.href = mailto;
  });
}
