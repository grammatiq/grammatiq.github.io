document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Cookie consent & conditional analytics
  const CONSENT_KEY = 'grammatiq_cookie_consent'; // values: 'accepted' | 'rejected'
  const gaMeta = document.querySelector('meta[name="ga-measurement-id"]');
  const GA_ID = gaMeta ? gaMeta.getAttribute('content') || '' : '';
  const bannerEl = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');

  const getConsent = () => localStorage.getItem(CONSENT_KEY);
  const setConsent = (value) => localStorage.setItem(CONSENT_KEY, value);

  const loadGA = (measurementId) => {
    if (!measurementId || window.dataLayer) return; // already loaded or missing
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', measurementId, { anonymize_ip: true });
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(gtagScript);
    const inline = document.createElement('script');
    inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${measurementId}',{anonymize_ip:true});`;
    document.head.appendChild(inline);
  };

  const maybeShowBannerOrLoad = () => {
    const consent = getConsent();
    if (consent === 'accepted') {
      if (GA_ID) loadGA(GA_ID);
      if (bannerEl) bannerEl.hidden = true;
    } else if (consent === 'rejected') {
      if (bannerEl) bannerEl.hidden = true;
    } else {
      if (bannerEl) bannerEl.hidden = false;
    }
  };

  if (acceptBtn) acceptBtn.addEventListener('click', () => { setConsent('accepted'); maybeShowBannerOrLoad(); });
  if (rejectBtn) rejectBtn.addEventListener('click', () => { setConsent('rejected'); maybeShowBannerOrLoad(); });
  maybeShowBannerOrLoad();

  // Várólista számláló – valós adat lekérdezése AWS Lambda-ról
  const SUBSCRIBER_COUNT_URL = 'https://s7dly2vj2zgopec6orbrqzauha0yghbz.lambda-url.eu-central-1.on.aws/';
  const counterEls = [
    document.getElementById('waitlist-counter'),
    document.getElementById('waitlist-counter-2')
  ].filter(Boolean);

  const formatCounterText = (count) => `Már ${count} feliratkozó a várólistán`;
  
  let currentCount = 0;

  const renderCounter = () => {
    counterEls.forEach(el => {
      el.textContent = formatCounterText(currentCount);
    });
  };

  renderCounter();
  
  // Valós szám lekérése és periódikus frissítése
  const updateCounterFromRemote = async () => {
    try {
      const res = await fetch(SUBSCRIBER_COUNT_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && typeof data.subscriber_count === 'number') {
        const next = Math.max(0, Math.floor(data.subscriber_count));
        if (Number.isFinite(next) && next !== currentCount) {
          currentCount = next;
          renderCounter();
        }
      }
    } catch (_) {
      // hálózati/CORS hibák némítása
    }
  };
  updateCounterFromRemote();
  setInterval(updateCounterFromRemote, 60000);

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

          // Valós számláló frissítése a távoli végpontból
          updateCounterFromRemote();
          
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