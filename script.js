/**
 * AlkaBoost — Main JavaScript
 * Handles:
 * - Mobile hamburger menu toggle & accessible backdrop
 * - Header shadow on scroll & Back-to-top button
 * - Gallery auto-playing slideshow (4s, hover pause, prefers-reduced-motion)
 * - Dual-submission forms (Formspree AJAX + WhatsApp wa.me pre-filled message)
 * - Client-side validation & inline feedback
 * - Dynamic copyright year
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // AlkaBoost Official WhatsApp Contact
  const ALKABOOST_PHONE = '919050211118';
  // Formspree endpoints (fallback endpoint for demonstration)
  const FORMSPREE_ORDER_URL = 'https://formspree.io/f/mqkvrgza';
  const FORMSPREE_VISIT_URL = 'https://formspree.io/f/mqkvrgza';

  /* --------------------------------------------------------------------------
     1. Dynamic Year
     -------------------------------------------------------------------------- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     2. Sticky Header Scroll Effect & Back-To-Top Button
     -------------------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    if (header) {
      if (scrollPos > 30) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollPos > 380) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. Mobile Hamburger Navigation
     -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mainNav = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav__link, .nav__cta-mobile a');

  function openNav() {
    if (!hamburgerBtn || !mainNav) return;
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('is-open');
    if (navBackdrop) navBackdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (!hamburgerBtn || !mainNav) return;
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    if (navBackdrop) navBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.contains('is-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeNav);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        closeNav();
      }
    });
  });

  // Close nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('is-open')) {
      closeNav();
    }
  });

  /* --------------------------------------------------------------------------
     4. Gallery Slideshow
     Features: 4s autoplay, pause on hover/focus, respect prefers-reduced-motion
     -------------------------------------------------------------------------- */
  const slideshow = document.getElementById('gallery-slideshow');
  const slides = document.querySelectorAll('.slideshow__slide');
  const dots = document.querySelectorAll('.slideshow__dots .dot');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');

  let currentSlide = 0;
  let slideInterval = null;
  const SLIDE_DURATION = 4000; // 4 seconds interval

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(index) {
    if (!slides.length) return;
    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlide);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
      dot.setAttribute('aria-selected', idx === currentSlide ? 'true' : 'false');
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (slideshow && slides.length > 0) {
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoplay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        startAutoplay();
      });
    });

    // Pause on hover
    slideshow.addEventListener('mouseenter', stopAutoplay);
    slideshow.addEventListener('mouseleave', startAutoplay);

    // Pause on keyboard focus inside slideshow
    slideshow.addEventListener('focusin', stopAutoplay);
    slideshow.addEventListener('focusout', startAutoplay);

    // Start initial autoplay
    startAutoplay();
  }

  /* --------------------------------------------------------------------------
     5. Form Validation & Dual-Submission (AJAX + WhatsApp)
     -------------------------------------------------------------------------- */

  /**
   * Helper: Show field error
   */
  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('has-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  /**
   * Helper: Clear field error
   */
  function clearFieldError(inputEl, errorEl) {
    if (!inputEl) return;
    inputEl.classList.remove('has-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
  }

  /**
   * Helper: Validate Indian phone number (10 digits minimum)
   */
  function isValidPhone(phone) {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13;
  }

  /* --------------------------------------------------------------------------
     A. Water Order Form
     -------------------------------------------------------------------------- */
  const orderForm = document.getElementById('water-order-form');
  const orderStatus = document.getElementById('order-status');
  const orderSubmitBtn = document.getElementById('order-submit-btn');

  if (orderForm) {
    const nameInput = document.getElementById('order-name');
    const phoneInput = document.getElementById('order-phone');
    const productInput = document.getElementById('order-product');
    const quantityInput = document.getElementById('order-quantity');
    const addressInput = document.getElementById('order-address');
    const notesInput = document.getElementById('order-notes');

    const nameErr = document.getElementById('order-name-error');
    const phoneErr = document.getElementById('order-phone-error');
    const productErr = document.getElementById('order-product-error');
    const quantityErr = document.getElementById('order-quantity-error');
    const addressErr = document.getElementById('order-address-error');

    // Real-time error clearing on input
    [nameInput, phoneInput, productInput, quantityInput, addressInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          clearFieldError(inp, inp.parentElement.querySelector('.form-field-error'));
        });
      }
    });

    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset errors
      let hasError = false;
      clearFieldError(nameInput, nameErr);
      clearFieldError(phoneInput, phoneErr);
      clearFieldError(productInput, productErr);
      clearFieldError(quantityInput, quantityErr);
      clearFieldError(addressInput, addressErr);

      if (orderStatus) {
        orderStatus.className = 'form-status';
        orderStatus.textContent = '';
      }

      // Validations
      const nameVal = nameInput.value.trim();
      if (!nameVal) {
        setFieldError(nameInput, nameErr, 'Please enter your full name.');
        hasError = true;
      } else if (nameVal.length < 2) {
        setFieldError(nameInput, nameErr, 'Name must be at least 2 characters.');
        hasError = true;
      }

      const phoneVal = phoneInput.value.trim();
      if (!phoneVal) {
        setFieldError(phoneInput, phoneErr, 'Please enter your phone number.');
        hasError = true;
      } else if (!isValidPhone(phoneVal)) {
        setFieldError(phoneInput, phoneErr, 'Please enter a valid 10-digit mobile number.');
        hasError = true;
      }

      const productVal = productInput.value;
      if (!productVal) {
        setFieldError(productInput, productErr, 'Please choose a product from the list.');
        hasError = true;
      }

      const quantityVal = parseInt(quantityInput.value, 10);
      if (isNaN(quantityVal) || quantityVal < 1) {
        setFieldError(quantityInput, quantityErr, 'Quantity must be at least 1.');
        hasError = true;
      }

      const addressVal = addressInput.value.trim();
      if (!addressVal) {
        setFieldError(addressInput, addressErr, 'Please enter your delivery address in Hisar.');
        hasError = true;
      } else if (addressVal.length < 6) {
        setFieldError(addressInput, addressErr, 'Please enter a complete address with street/locality.');
        hasError = true;
      }

      if (hasError) return;

      // Loading state
      const originalBtnText = orderSubmitBtn.innerHTML;
      orderSubmitBtn.disabled = true;
      orderSubmitBtn.innerHTML = `
        <svg class="icon animate-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <span>Processing Order...</span>
      `;

      // Compose WhatsApp Message
      const notesVal = notesInput ? notesInput.value.trim() : '';
      let waMessage = `*New AlkaBoost Water Order* 🌊%0A%0A` +
        `👤 *Customer Name:* ${encodeURIComponent(nameVal)}%0A` +
        `📱 *Phone Number:* ${encodeURIComponent(phoneVal)}%0A` +
        `💧 *Selected Product:* ${encodeURIComponent(productVal)}%0A` +
        `📦 *Quantity:* ${encodeURIComponent(quantityVal)}%0A` +
        `📍 *Delivery Address:* ${encodeURIComponent(addressVal)}`;

      if (notesVal) {
        waMessage += `%0A📝 *Instructions:* ${encodeURIComponent(notesVal)}`;
      }

      const whatsappUrl = `https://wa.me/${ALKABOOST_PHONE}?text=${waMessage}`;

      // Submit via AJAX to Formspree backend
      const formData = new FormData(orderForm);
      formData.append('_subject', `New AlkaBoost Water Order from ${nameVal}`);

      try {
        await fetch(FORMSPREE_ORDER_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        }).catch(() => {
          // Network errors or unverified endpoints gracefully fallback
        });
      } catch (err) {
        console.warn('Formspree notification notice:', err);
      }

      // Display inline success status
      if (orderStatus) {
        orderStatus.className = 'form-status is-success';
        orderStatus.innerHTML = `
          <strong>✓ Order recorded successfully!</strong><br />
          Opening WhatsApp to send your order directly to the AlkaBoost team. If WhatsApp does not open automatically, <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline; font-weight:700;">click here to chat</a>.
        `;
      }

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Reset form
      orderForm.reset();
      orderSubmitBtn.disabled = false;
      orderSubmitBtn.innerHTML = originalBtnText;
    });
  }

  /* --------------------------------------------------------------------------
     B. Machine Free Visit Booking Form
     -------------------------------------------------------------------------- */
  const visitForm = document.getElementById('visit-form');
  const visitStatus = document.getElementById('visit-status');
  const visitSubmitBtn = document.getElementById('visit-submit-btn');

  // Set default min date to today for visit date picker
  const visitDateInput = document.getElementById('visit-date');
  if (visitDateInput) {
    const today = new Date().toISOString().split('T')[0];
    visitDateInput.setAttribute('min', today);
  }

  if (visitForm) {
    const vNameInput = document.getElementById('visit-name');
    const vPhoneInput = document.getElementById('visit-phone');
    const vAddressInput = document.getElementById('visit-address');
    const vTypeInput = document.getElementById('visit-type');

    const vNameErr = document.getElementById('visit-name-error');
    const vPhoneErr = document.getElementById('visit-phone-error');
    const vAddressErr = document.getElementById('visit-address-error');
    const vDateErr = document.getElementById('visit-date-error');

    // Real-time error clearing
    [vNameInput, vPhoneInput, vAddressInput, visitDateInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          clearFieldError(inp, inp.parentElement.querySelector('.form-field-error'));
        });
      }
    });

    visitForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasError = false;
      clearFieldError(vNameInput, vNameErr);
      clearFieldError(vPhoneInput, vPhoneErr);
      clearFieldError(vAddressInput, vAddressErr);
      clearFieldError(visitDateInput, vDateErr);

      if (visitStatus) {
        visitStatus.className = 'form-status';
        visitStatus.textContent = '';
      }

      // Validations
      const nameVal = vNameInput.value.trim();
      if (!nameVal) {
        setFieldError(vNameInput, vNameErr, 'Please enter your full name.');
        hasError = true;
      }

      const phoneVal = vPhoneInput.value.trim();
      if (!phoneVal) {
        setFieldError(vPhoneInput, vPhoneErr, 'Please enter your contact number.');
        hasError = true;
      } else if (!isValidPhone(phoneVal)) {
        setFieldError(vPhoneInput, vPhoneErr, 'Please enter a valid 10-digit mobile number.');
        hasError = true;
      }

      const addressVal = vAddressInput.value.trim();
      if (!addressVal) {
        setFieldError(vAddressInput, vAddressErr, 'Please enter your address in Hisar.');
        hasError = true;
      }

      const dateVal = visitDateInput.value;
      if (!dateVal) {
        setFieldError(visitDateInput, vDateErr, 'Please select your preferred visit date.');
        hasError = true;
      }

      if (hasError) return;

      // Loading state
      const originalBtnText = visitSubmitBtn.innerHTML;
      visitSubmitBtn.disabled = true;
      visitSubmitBtn.innerHTML = `
        <svg class="icon animate-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <span>Scheduling Visit...</span>
      `;

      // Compose WhatsApp Message for Free Visit
      const typeVal = vTypeInput ? vTypeInput.value : 'Home / Residential';
      const waMessage = `*New AlkaBoost Free Machine Visit Booking* 🔧%0A%0A` +
        `👤 *Name:* ${encodeURIComponent(nameVal)}%0A` +
        `📱 *Phone:* ${encodeURIComponent(phoneVal)}%0A` +
        `📍 *Location / Address:* ${encodeURIComponent(addressVal)}%0A` +
        `📅 *Preferred Date:* ${encodeURIComponent(dateVal)}%0A` +
        `🏢 *Setup Type:* ${encodeURIComponent(typeVal)}`;

      const whatsappUrl = `https://wa.me/${ALKABOOST_PHONE}?text=${waMessage}`;

      // Submit via AJAX to Formspree backend
      const formData = new FormData(visitForm);
      formData.append('_subject', `New AlkaBoost Free Machine Visit Request from ${nameVal}`);

      try {
        await fetch(FORMSPREE_VISIT_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        }).catch(() => {});
      } catch (err) {
        console.warn('Formspree notification notice:', err);
      }

      // Display inline success status
      if (visitStatus) {
        visitStatus.className = 'form-status is-success';
        visitStatus.innerHTML = `
          <strong>✓ Visit request submitted!</strong><br />
          Opening WhatsApp to confirm your appointment time with AlkaBoost. If WhatsApp does not open automatically, <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline; font-weight:700;">click here to message us</a>.
        `;
      }

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Reset form
      visitForm.reset();
      visitSubmitBtn.disabled = false;
      visitSubmitBtn.innerHTML = originalBtnText;
    });
  }

  /* --------------------------------------------------------------------------
     6. Smooth Scroll Offset Fix for In-Page Anchor Links
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
