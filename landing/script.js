document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Cookie consent & conditional analytics
  const CONSENT_KEY = 'grammatiq_cookie_consent'; // stores JSON: { analytics: boolean, timestamp: number }
  const gaMeta = document.querySelector('meta[name="ga-measurement-id"]');
  const GA_ID = gaMeta ? gaMeta.getAttribute('content') || '' : '';
  const bannerEl = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('cookie-accept');
  const detailsToggleBtn = document.getElementById('cookie-details-toggle');
  const detailsEl = document.getElementById('cookie-details');
  const primaryActionsEl = document.getElementById('cookie-primary-actions');
  const analyticsSwitch = document.getElementById('cookie-analytics');
  const saveBtn = document.getElementById('cookie-save');

  const getConsent = () => {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  };
  const setConsent = (obj) => localStorage.setItem(CONSENT_KEY, JSON.stringify(obj));

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
    if (consent && typeof consent === 'object') {
      // Load services based on categories
      if (consent.analytics && GA_ID) loadGA(GA_ID);
      if (bannerEl) bannerEl.hidden = true;
    } else {
      if (bannerEl) bannerEl.hidden = false;
    }
  };

  if (acceptBtn) acceptBtn.addEventListener('click', () => {
    setConsent({ analytics: true, timestamp: Date.now() });
    maybeShowBannerOrLoad();
  });

  if (detailsToggleBtn && detailsEl) {
    detailsToggleBtn.addEventListener('click', () => {
      const isOpen = detailsToggleBtn.getAttribute('aria-expanded') === 'true';
      detailsToggleBtn.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        detailsEl.hidden = false;
        detailsEl.classList.add('active');
        // Elrejtjük az elsődleges gombokat, ha belépett a részletekbe
        if (primaryActionsEl) primaryActionsEl.style.display = 'none';
      } else {
        // Ha visszazárná (bár UI-ban már nem látja a fő gombokat), maradjon a részletek nézet
        detailsEl.hidden = false;
        detailsEl.classList.add('active');
      }
      // Prefill current stored choice
      const stored = getConsent();
      if (analyticsSwitch && stored && typeof stored === 'object') {
        analyticsSwitch.checked = !!stored.analytics;
      }
    });
  }

  if (saveBtn) saveBtn.addEventListener('click', () => {
    const analyticsEnabled = analyticsSwitch ? !!analyticsSwitch.checked : false;
    setConsent({ analytics: analyticsEnabled, timestamp: Date.now() });
    maybeShowBannerOrLoad();
  });

  // Nincs "Elutasítok mindent" gomb – teljes elutasítás nem kerül külön kezelésre
  maybeShowBannerOrLoad();

  // Egyszeri visszaszámlálás október 22. 00:00-ig (helyi idő szerint) – napokban
  const daysLeftEl = document.getElementById('days-left');

  const getNextOct22Midnight = (now) => {
    const year = now.getFullYear();
    // Helyi időzóna szerinti október (JS-ben 0-indexelt hónap, tehát 9 = október)
    let target = new Date(year, 9, 22, 0, 0, 0, 0);
    if (now.getTime() > target.getTime()) {
      target = new Date(year + 1, 9, 22, 0, 0, 0, 0);
    }
    return target;
  };

  const renderDaysLeft = () => {
    if (!daysLeftEl) return;
    const now = new Date();
    const target = getNextOct22Midnight(now);
    const diffMs = target.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    daysLeftEl.textContent = String(days);
  };

  renderDaysLeft();

  // Várólista számláló – valós adat lekérdezése AWS Lambda-ról
  const SUBSCRIBER_COUNT_URL = 'https://s7dly2vj2zgopec6orbrqzauha0yghbz.lambda-url.eu-central-1.on.aws/';
  const counterEls = [
    document.getElementById('waitlist-counter'),
    document.getElementById('waitlist-counter-2')
  ].filter(Boolean);
  
  const remainingSpotsEl = document.getElementById('remaining-spots');
  const MAX_SPOTS = 50;

  const formatCounterText = (count) => `${count} vállalkozó már biztosította a helyét`;
  
  let currentCount = 8; // Kezdő érték az AIDA szöveghez illeszkedően

  const renderCounter = () => {
    counterEls.forEach(el => {
      el.textContent = formatCounterText(currentCount);
    });
    
    // Fennmaradó helyek frissítése
    if (remainingSpotsEl) {
      const remaining = Math.max(0, MAX_SPOTS - currentCount);
      remainingSpotsEl.textContent = remaining;
    }
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