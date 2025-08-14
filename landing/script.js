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
        showHint('Kérlek, add meg az email címed.', 'error');
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
      submitBtn.textContent = 'Küldés...';
      showHint('Átirányítás a Mailchimpre...');
    });

    emailInput.addEventListener('input', () => {
      if (emailInput.value.length > 0) {
        showHint('Az adataidat biztonságosan kezeljük.');
      } else {
        showHint('');
      }
    });
  }
});