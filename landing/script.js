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

  // Handle both forms
  const forms = [
    {
      form: document.getElementById('waitlist-form'),
      emailInput: document.getElementById('mce-EMAIL'),
      hint: document.getElementById('form-hint'),
      submitBtn: document.getElementById('submit-btn'),
      consent: document.getElementById('consent-1')
    },
    {
      form: document.getElementById('final-waitlist-form'),
      emailInput: document.getElementById('final-email'),
      hint: document.getElementById('final-form-hint'),
      submitBtn: document.getElementById('final-submit-btn'),
      consent: document.getElementById('final-consent-1')
    }
  ];

  const showHint = (hintElement, message, type = 'info') => {
    if (!hintElement) return;
    hintElement.textContent = message;
    hintElement.style.color = type === 'error' ? '#fca5a5' : type === 'success' ? '#34d399' : '#b6c2d6';
  };

  forms.forEach(({ form, emailInput, hint, submitBtn, consent }) => {
    if (form && emailInput && submitBtn) {
      const originalBtnText = submitBtn.textContent;
      form.addEventListener('submit', (e) => {
        const email = emailInput.value.trim();
        if (!email) {
          e.preventDefault();
          showHint(hint, 'Kérlek, add meg az e‑mail‑címed.', 'error');
          emailInput.focus();
          return;
        }
        if (consent && !consent.checked) {
          e.preventDefault();
          showHint(hint, 'Kérlek, fogadd el az adatkezelési feltételeket.', 'error');
          consent.focus();
          return;
        }
        
        // Prevent default form submit
        e.preventDefault();
        
        // Get the form action URL and convert it to AJAX endpoint
        const formAction = form.action;
        const ajaxUrl = formAction.replace('/post?', '/post-json?') + '&c=?';
        
        // Disable button while submitting
        submitBtn.disabled = true;
        submitBtn.textContent = 'Folyamatban...';

        // Prepare form data
        const formData = new FormData(form);
        const searchParams = new URLSearchParams();
        for (const [key, value] of formData) {
          searchParams.append(key, value);
        }
        
        // Send AJAX request
        fetch(ajaxUrl, {
          method: 'POST',
          body: searchParams,
          mode: 'no-cors'
        }).then(() => {
          // Success
          submitBtn.textContent = 'Feliratkozva!';
          showHint(hint, 'Köszönjük! Értesítünk, amint indul a próbaverzió.', 'success');
          form.reset();
          
          // Reset button after 3 seconds
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            showHint(hint, '');
          }, 3000);
        }).catch(error => {
          // Error
          console.error('Subscription error:', error);
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          showHint(hint, 'Hiba történt. Kérjük, próbáld újra később.', 'error');
        });
      });

      emailInput.addEventListener('input', () => {
        if (emailInput.value.length > 0) {
          showHint(hint, 'Az adataidat biztonságosan kezeljük.');
        } else {
          showHint(hint, '');
        }
      });
    }
  });

});