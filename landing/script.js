document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu functionality
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

    // Close menu when clicking on a link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
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
        showHint('Please enter your email address.', 'error');
        emailInput.focus();
        return;
      }
      if (!consent.checked) {
        e.preventDefault();
        showHint('Please check the consent box.', 'error');
        consent.focus();
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      showHint('Redirecting to Mailchimp…');
    });

    emailInput.addEventListener('input', () => {
      if (emailInput.value.length > 0) {
        showHint('We handle your data securely.');
      } else {
        showHint('');
      }
    });
  }

  // Demo: dynamic typing and transformation (multiple variants)
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
    { original: 'We’re launching next week. Draft press note below.', corrected: 'Press note: concise lead, clear benefit, source link, embargo details.' },
    { original: 'Notes: Q2 results, growth in EU, new product beta.', corrected: 'Story draft: Q2 EU growth confirmed. Add chart, cite CFO call, link 10‑Q.' },
    { original: 'Blog idea: customer story about ramp time.', corrected: 'Article outline: headline options, quotes, proof points, CTA. On‑brand tone.' },
    { original: 'Need LinkedIn + X post from the article.', corrected: 'Social suite: LinkedIn post, X thread, platform‑native hooks, alt text.' },
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