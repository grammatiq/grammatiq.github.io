document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobil menü működés
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');

  if (mobileMenuToggle && mobileNav && mobileNavClose) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    mobileNavClose.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Menü zárása linkre kattintáskor
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Menü zárása a háttérre kattintva
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  const form = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('mce-EMAIL');
  const hint = document.getElementById('form-hint');
  const submitBtn = document.getElementById('submit-btn');
  const consent = document.getElementById('consent');

  const showHint = (message, type = 'info') => {
    if (!hint) return;
    hint.textContent = message;
    hint.style.color = type === 'error' ? '#fca5a5' : '#b6c2d6';
  };

  if (form && emailInput && submitBtn && consent) {
    form.addEventListener('submit', (e) => {
      const email = emailInput.value.trim();
      if (!email) {
        e.preventDefault();
        showHint('Kérlek, add meg az e‑mail‑címed.', 'error');
        emailInput.focus();
        return;
      }
      if (!consent.checked) {
        e.preventDefault();
        showHint('Kérlek, jelöld be a hozzájárulást.', 'error');
        consent.focus();
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Küldés…';
      showHint('Átirányítás a Mailchimpre…');
    });

    emailInput.addEventListener('input', () => {
      if (emailInput.value.length > 0) {
        showHint('Az adataidat biztonságosan kezeljük.');
      } else {
        showHint('');
      }
    });
  }

  // Demo: dinamikus gépelés és transzformáció (több variáns)
  const originalTarget = document.getElementById('typed-original');
  const correctedTarget = document.getElementById('typed-corrected');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  async function typeInto(el, text, minDelay = 28, maxDelay = 60) {
    if (!el) return;
    el.textContent = '';
    for (const char of text) {
      el.textContent += char;
      const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
      await sleep(delay);
    }
  }

  const demoPairs = [
    { original: 'Jövő héten indulunk. Alább egy sajtóközlemény‑vázlat.', corrected: 'Sajtóközlemény: tömör lead, világos előny, forráslink, embargó.' },
    { original: 'Jegyzetek: Q2 eredmények, EU növekedés, új termék béta.', corrected: 'Cikkvázlat: Q2 EU növekedés megerősítve. Grafikon, CFO call hivatkozás, 10‑Q link.' },
    { original: 'Blog ötlet: ügyfélsztori a bevezetési időről.', corrected: 'Cikk struktúra: címopciók, idézetek, bizonyítékok, CTA. Márkahű tónus.' },
    { original: 'Kell LinkedIn + X poszt a cikkből.', corrected: 'Social csomag: LinkedIn poszt, X thread, natív hookok, alt szöveg.' },
  ];

  async function runTypingDemo() {
    if (!originalTarget || !correctedTarget) return;
    let idx = 0;
    while (true) {
      const pair = demoPairs[idx];
      originalTarget.textContent = '';
      correctedTarget.textContent = '';
      await sleep(400);
      await typeInto(originalTarget, pair.original, 26, 55);
      await sleep(700);
      await typeInto(correctedTarget, pair.corrected, 24, 50);
      await sleep(1800);
      idx = (idx + 1) % demoPairs.length;
    }
  }
  runTypingDemo();
});