// Theme toggle and persistence
const toggle = document.getElementById('theme-toggle');
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    toggle.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
    toggle.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('dark-mode');
    toggle.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
    toggle.setAttribute('aria-pressed', 'false');
  }
  try { localStorage.setItem('theme', theme); } catch (e) {}
}
toggle.addEventListener('click', () => {
  const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(next);
});

// Mobile Menu Toggle (improved)
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isExpanded);
    navToggle.querySelector('i').classList.toggle('fa-bars');
    navToggle.querySelector('i').classList.toggle('fa-times');
  });

  // Close menu when a link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelector('i').classList.add('fa-bars');
      navToggle.querySelector('i').classList.remove('fa-times');
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelector('i').classList.add('fa-bars');
      navToggle.querySelector('i').classList.remove('fa-times');
    }
  });
}

// Typing animation (improved) — graceful with prefers-reduced-motion
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const typingElement = document.querySelector('.typing');
const typingTextEl = typingElement ? typingElement.querySelector('.typing-text') : null;
const caretEl = typingElement ? typingElement.querySelector('.caret') : null;
const typingPhrases = ["Hi, I'm Sumit Sahani!", "Web Developer", "UI/UX Enthusiast"];
function startTyping() {
  if (!typingTextEl) return;
  if (prefersReducedMotion) {
    typingTextEl.textContent = typingPhrases[0];
    if (caretEl) caretEl.style.display = 'none';
    return;
  }

  let phraseIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = typingPhrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      typingTextEl.textContent = current.substring(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 900);
        return;
      }
      setTimeout(tick, 120);
    } else {
      charIndex--;
      typingTextEl.textContent = current.substring(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 60);
    }
  }
  tick();
}

// Scroll Progress Indicator (rAF-friendly)
const progressEl = document.querySelector('.scroll-progress');
let latestKnownScrollY = 0, ticking = false;
function updateScrollProgress() {
  latestKnownScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight || 1;
      const pct = Math.min(100, Math.max(0, (latestKnownScrollY / docHeight) * 100));
      if (progressEl) progressEl.style.width = pct + '%';
      ticking = false;
    });
    ticking = true;
  }
}

// Back to Top Button Visibility
function toggleBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

// Sticky Navigation
function handleStickyNav() {
  const nav = document.querySelector('.sticky-nav');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

// Intersection Observer: reveal elements, animate skills, and prepare tilt
const ioOptions = { root: null, threshold: 0.12 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.classList.add('reveal');
      // Start CSS animation if defined
      if (el.style && 'animationPlayState' in el.style) el.style.animationPlayState = 'running';

      // Skills: animate progress bars
      if (el.classList.contains('skill')) {
        const bar = el.querySelector('.skill-progress');
        if (bar && bar.dataset && bar.dataset.progress) {
          const pct = parseInt(bar.dataset.progress, 10);
          bar.style.width = pct + '%';
          // Update aria value on parent progressbar
          if (el.getAttribute('role') === 'progressbar') el.setAttribute('aria-valuenow', pct);
        }
      }

      // Stop observing once done for one-time reveals
      io.unobserve(el);
    }
  });
}, ioOptions);

document.querySelectorAll('.project-card, .skill').forEach((el, i) => {
  el.style.setProperty('--index', i + 1);
  // Pause any existing CSS animation until revealed
  el.style.animationPlayState = 'paused';
  io.observe(el);
});

// Form Validation (keeps existing behavior)
const form = document.getElementById('contact-form');
if (form) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const formLoading = document.getElementById('form-loading');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    if (nameError) { nameError.textContent = ''; nameError.classList.add('sr-only'); }
    if (emailError) { emailError.textContent = ''; emailError.classList.add('sr-only'); }
    if (messageError) { messageError.textContent = ''; messageError.classList.add('sr-only'); }

    // Validate name
    if (!nameInput || nameInput.value.trim().length < 2) {
      if (nameError) { nameError.textContent = 'Name must be at least 2 characters long'; nameError.classList.remove('sr-only'); }
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
      if (emailError) { emailError.textContent = 'Please enter a valid email address'; emailError.classList.remove('sr-only'); }
      isValid = false;
    }

    // Validate message
    if (!messageInput || messageInput.value.trim().length < 10) {
      if (messageError) { messageError.textContent = 'Message must be at least 10 characters long'; messageError.classList.remove('sr-only'); }
      isValid = false;
    }

    if (isValid) {
      if (formLoading) formLoading.classList.remove('sr-only');
      const submitBtn = form.querySelector('button');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.reset();
          if (formLoading) formLoading.textContent = 'Message sent successfully!';
          setTimeout(() => {
            if (formLoading) { formLoading.classList.add('sr-only'); formLoading.textContent = 'Submitting...'; }
          }, 3000);
        } else {
          if (formLoading) formLoading.textContent = 'Error sending message. Please try again.';
        }
      } catch (error) {
        if (formLoading) formLoading.textContent = 'Error sending message. Please try again.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Theme persistence
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  // Start typing animation
  startTyping();

  // Add scroll event listeners
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    toggleBackToTop();
    handleStickyNav();
  }, { passive: true });

  // Initialize tilt handlers for project cards (disabled on touch devices)
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
  if (!prefersReducedMotion && !isTouchDevice()) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (ev) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = ev.clientX - cx;
        const dy = ev.clientY - cy;
        const px = (dy / rect.height) * -10; // rotateX
        const py = (dx / rect.width) * 10; // rotateY
        card.style.transform = `perspective(900px) rotateX(${px}deg) rotateY(${py}deg)`;
        card.classList.add('tilting');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.classList.remove('tilting');
      });
    });
  }

  // Initial scroll check
  updateScrollProgress();
  toggleBackToTop();
  handleStickyNav();

  // Project preview modal: open iframe on desktop, fallback to new tab on touch/small screens
  const previewModal = document.getElementById('preview-modal');
  const previewOverlay = previewModal ? previewModal.querySelector('.modal-overlay') : null;
  const previewClose = previewModal ? previewModal.querySelector('.modal-close') : null;
  const previewIframe = previewModal ? previewModal.querySelector('#preview-iframe') : null;

  const isSmallScreenOrTouch = () => (window.innerWidth < 700) || ('ontouchstart' in window) || window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = btn.dataset.preview;
      if (!url) return;
      // On small/touch devices, open in a new tab for better UX
      if (isSmallScreenOrTouch()) {
        window.open(url, '_blank');
        return;
      }

      if (previewIframe && previewModal) {
        previewIframe.src = url;
        previewModal.classList.add('open');
        previewModal.setAttribute('aria-hidden', 'false');
        // focus the close button for accessibility
        if (previewClose) previewClose.focus();
      }
    });
  });

  function closePreview() {
    if (!previewModal) return;
    previewModal.classList.remove('open');
    previewModal.setAttribute('aria-hidden', 'true');
    if (previewIframe) {
      // unload iframe to stop scripts/media
      previewIframe.src = '';
    }
  }

  if (previewOverlay) previewOverlay.addEventListener('click', closePreview);
  if (previewClose) previewClose.addEventListener('click', closePreview);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal && previewModal.classList.contains('open')) {
      closePreview();
    }
  });
});
