document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Nincs cookie banner és nincs Google Analytics – Simple Analytics-t használunk (cookieless)

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
  
  let currentCount = 30; // Kezdő érték az AIDA szöveghez illeszkedően

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
          currentCount = next + 30;
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

  // Simple Lightbox for Product Gallery
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length > 0) {
    let currentImageIndex = 0;
    let images = [];
    
    // Collect all images
    galleryItems.forEach((item, index) => {
      const img = item.querySelector('img');
      const title = item.getAttribute('data-title');
      images.push({
        src: img.src,
        alt: img.alt,
        title: title || img.alt
      });
    });
    
    // Create lightbox HTML
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">‹</button>
        <button class="lightbox-next">›</button>
        <img class="lightbox-image" src="" alt="" />
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    function showImage(index) {
      const image = images[index];
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
      lightboxCaption.textContent = image.title;
      currentImageIndex = index;
    }
    
    function openLightbox(index) {
      showImage(index);
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
    
    function nextImage() {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      showImage(currentImageIndex);
    }
    
    function prevImage() {
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      showImage(currentImageIndex);
    }
    
    // Event listeners
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
      if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    });
  }

});