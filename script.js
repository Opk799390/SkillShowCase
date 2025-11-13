/* Shared JS for Portfolio V2
   - Enhanced portfolio for Sumit Sahani
   - GSAP-based loader and page intro
   - Improved projects rendering + filters
*/

const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Projects data (edit here) ---------- */
const projects = [
  {
    id: 'portfolio',
    title: 'Portfolio Website V2',
    desc: 'Modern, responsive portfolio built with semantic HTML5, CSS3, and vanilla JavaScript. Features GSAP animations, accessibility, and smooth scroll effects.',
    img: 'assets/images/portfolio-preview.svg',
    repo: 'https://github.com/sumit-sahani/portfolio-v2',
    live: '/index.html',
    tags: ['web', 'design']
  },
  {
    id: 'weather-app',
    title: 'Weather App - Real-time Updates',
    desc: 'Dynamic weather application with OpenWeatherMap API integration. Displays real-time weather data, temperature, humidity, and forecasts with a clean, intuitive UI.',
    img: 'assets/images/weather-app-preview.svg',
    repo: 'https://github.com/sumit-sahani/weather-app',
    live: '/projects/weather-app/index.html',
    tags: ['web','tools']
  },
  {
    id: 'todo-list',
    title: 'Todo List Application',
    desc: 'Feature-rich todo management app built with vanilla JavaScript. Includes add/edit/delete functionality, localStorage persistence, and keyboard accessibility.',
    img: 'assets/images/todo-list-preview.svg',
    repo: 'https://github.com/sumit-sahani/todo-list',
    live: '/projects/todo-list/index.html',
    tags: ['tools']
  }
];

/* ---------- Theme toggle & persistence ---------- */
function applyTheme(theme, btn){
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    if (btn) btn.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
    setAriaPressed(btn, true);
  } else {
    document.body.classList.remove('dark-mode');
    if (btn) btn.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
    setAriaPressed(btn, false);
  }
  try { localStorage.setItem('theme', theme); } catch (e) {}
}
function setAriaPressed(btn, val){
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(!!val));
}

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // theme buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(next, btn);
      // sync across other toggles
      document.querySelectorAll('.theme-toggle').forEach(b => applyTheme(next, b));
    });
  });

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(b => applyTheme(initialTheme, b));

  // mobile nav toggle
  document.querySelectorAll('.nav-toggle').forEach(toggle => {
    const nav = toggle.parentElement.querySelector('.nav-menu');
    toggle.addEventListener('click', () => {
      const active = nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', active);
      toggle.querySelector('i').classList.toggle('fa-bars');
      toggle.querySelector('i').classList.toggle('fa-times');
    });
  });
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      const menu = link.closest('.nav-menu');
      if (menu && menu.classList.contains('active')) {
        menu.classList.remove('active');
        const toggle = document.querySelector('.nav-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.querySelector('i').classList.add('fa-bars');
          toggle.querySelector('i').classList.remove('fa-times');
        }
      }
    });
  });

  /* typing */
  const typingElement = document.querySelector('.typing');
  const typingTextEl = typingElement ? typingElement.querySelector('.typing-text') : null;
  const caretEl = typingElement ? typingElement.querySelector('.caret') : null;
  const typingPhrases = ["Hi, I'm Sumit!", "Web Developer", "UI/UX Enthusiast"];

  if (typingTextEl) {
    if (isReduced) {
      typingTextEl.textContent = typingPhrases[0];
      if (caretEl) caretEl.style.display = 'none';
    } else {
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
  }

  /* scroll UI */
  const progressEl = document.querySelector('.scroll-progress');
  function updateScrollProgress(){
    const latest = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight || 1;
    const pct = Math.min(100, Math.max(0, (latest / docHeight) * 100));
    if (progressEl) progressEl.style.width = pct + '%';
  }
  function handleScrollUI(){
    document.querySelectorAll('.sticky-nav').forEach(nav => {
      if (window.scrollY > 50) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    });
    document.querySelectorAll('.back-to-top').forEach(btn => {
      if (window.scrollY > 300) btn.classList.add('visible'); else btn.classList.remove('visible');
    });
    updateScrollProgress();
  }
  window.addEventListener('scroll', handleScrollUI, { passive: true });
  handleScrollUI();
  document.querySelectorAll('.back-to-top').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  /* projects teaser (on home) */
  if (document.body.dataset.page === 'home') {
    const teaserRow = document.getElementById('projects-teaser-row');
    if (teaserRow) {
      projects.slice(0,3).forEach((p,i) => {
        const art = document.createElement('article');
        art.className = 'project-card';
        art.style.setProperty('--index', i+1);
        art.setAttribute('data-tilt','');
        const linksHTML = `
          <div class="project-links">
            <a href="${p.live}" target="_blank" rel="noopener noreferrer" style="pointer-events: auto; cursor: pointer;">Live Demo</a>
            <a href="${p.repo}" target="_blank" rel="noopener noreferrer" style="pointer-events: auto; cursor: pointer;">GitHub</a>
          </div>
        `;
        art.innerHTML = `
          <img src="${p.img}" alt="${p.title} preview" loading="lazy">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          ${linksHTML}
        `;
        teaserRow.appendChild(art);
      });
    }
  }

  /* Projects page rendering */
  if (document.body.dataset.page === 'projects') {
    const container = document.getElementById('projects-container');
    const search = document.getElementById('projects-search');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function renderList(list) {
      if (!container) return;
      container.innerHTML = '';
      if (!list.length) { container.innerHTML = '<p style="text-align:center;color:var(--muted)">No projects found.</p>'; return; }
      list.forEach((p,i) => {
        const art = document.createElement('article');
        art.className = 'project-card';
        art.style.setProperty('--index', i+1);
        art.setAttribute('data-tilt','');
        art.id = p.id;
        const linksHTML = `
          <div class="project-links">
            <a href="${p.repo}" target="_blank" rel="noopener noreferrer" style="pointer-events: auto; cursor: pointer;">GitHub</a>
            <a href="${p.live}" target="_blank" rel="noopener noreferrer" style="pointer-events: auto; cursor: pointer;">Live Demo</a>
          </div>
        `;
        art.innerHTML = `
          <img src="${p.img}" alt="${p.title} preview" loading="lazy">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          ${linksHTML}
        `;
        container.appendChild(art);
      });
      // reinit tilt & reveal
      initTilt();
      runRevealAnimations();
    }

    renderList(projects);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        const filtered = f === 'all' ? projects : projects.filter(p=>p.tags.includes(f));
        renderList(filtered);
      });
    });

    search?.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      renderList(projects.filter(p => (p.title + ' ' + p.desc).toLowerCase().includes(q)));
    });
  }

  /* Contact form validation + submit */
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
      if (nameError) { nameError.textContent = ''; nameError.classList.add('sr-only'); }
      if (emailError) { emailError.textContent = ''; emailError.classList.add('sr-only'); }
      if (messageError) { messageError.textContent = ''; messageError.classList.add('sr-only'); }

      if (!nameInput || nameInput.value.trim().length < 2) {
        if (nameError) { nameError.textContent = 'Name must be at least 2 characters long'; nameError.classList.remove('sr-only'); }
        isValid = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
        if (emailError) { emailError.textContent = 'Please enter a valid email address'; emailError.classList.remove('sr-only'); }
        isValid = false;
      }
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
            setTimeout(()=>{ if (formLoading) { formLoading.classList.add('sr-only'); formLoading.textContent='Submitting...'; } }, 3000);
          } else {
            if (formLoading) formLoading.textContent = 'Error sending message. Please try again.';
          }
        } catch (err) {
          if (formLoading) formLoading.textContent = 'Error sending message. Please try again.';
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      }
    });
  }

  /* ---------- Animations: Reveal & GSAP ---------- */
  function runRevealAnimations() {
    // fallback simple CSS reveals if GSAP missing or prefers-reduced-motion
    if (typeof gsap === 'undefined' || isReduced) {
      document.querySelectorAll('.project-card, .skill, .page-header, .bio-text, .timeline-item').forEach((el,i) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(12px)';
        setTimeout(()=>{ el.style.transition = 'opacity .6s ease, transform .6s ease'; el.style.opacity = 1; el.style.transform = 'translateY(0)'; }, 120 + i * 60);
      });
      return;
    }

    try { gsap.registerPlugin(ScrollTrigger); } catch(e) {}
    // hero/page intro
    gsap.from('.hero-content, .page-header', { y: 20, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.06 });

    // elements reveal on scroll
    gsap.utils.toArray('.project-card, .skill, .bio-text, .timeline-item').forEach(el => {
      gsap.fromTo(el, { y: 14, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // skills animation
    gsap.utils.toArray('.skill').forEach(skill => {
      const bar = skill.querySelector('.skill-progress');
      const pct = bar ? parseInt(bar.dataset.progress || 0, 10) : 0;
      if (bar) {
        gsap.fromTo(bar, { width: 0 }, {
          width: pct + '%', duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: skill, start: 'top 88%' }
        });
      }
    });
  }
  runRevealAnimations();

  /* ---------- Tilt effect (mouse only) ---------- */
  function initTilt(){
    const isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (isReduced || isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      let tiltTimeout;
      card.addEventListener('mousemove', (ev) => {
        // Check if click is on a link
        if (ev.target.tagName === 'A' || ev.target.closest('a')) return;
        
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = ev.clientX - cx;
        const dy = ev.clientY - cy;
        const rx = (dy / rect.height) * -8;
        const ry = (dx / rect.width) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => { 
        card.style.transform = ''; 
      });
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
          card.style.transform = '';
        }
      });
    });
  }
  initTilt();

  /* ---------- Loader: GSAP-based sequence (index only) ---------- */
  (function loaderSequence(){
    const loader = document.getElementById('loader');
    if (!loader) return;
    // if GSAP not present or reduced motion -> hide loader after short timeout
    if (typeof gsap === 'undefined' || isReduced) {
      setTimeout(()=>{ loader.classList.add('hidden'); setTimeout(()=>loader.remove(), 600); }, 700);
      return;
    }

    const logo = document.getElementById('loader-logo');
    const logoPath = document.getElementById('letter-s');
    const inner = loader.querySelector('.loader-inner');
    const backdrop = loader.querySelector('.loader-backdrop');

    // timeline: pulse + rotate + fade out
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' }
    });
    tl.to(logo, { scale: 1.06, duration: 0.9, repeat: 3, yoyo: true })
      .to(logo, { rotate: 12, duration: 0.6 })
      .to(logo, { rotate: -10, duration: 0.6 })
      .to(logo, { rotate: 0, duration: 0.4 })
      .to(inner, { y: -6, duration: 0.6 })
      // final reveal to page
      .to(backdrop, { opacity: 0, duration: 0.6 }, 'end')
      .to(loader, { opacity: 0, duration: 0.6, onComplete: () => {
        loader.classList.add('hidden');
        try { loader.remove(); } catch(e) {}
        // after loader removed, run page-intro burst
        gsap.from('.hero-content, .page-header', { y: 18, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' });
      }});
    // safety: if page load hasn't finished in 4s, force hide
    setTimeout(()=>{ if (document.getElementById('loader')) { document.getElementById('loader').classList.add('hidden'); } }, 4500);
  })();

  /* ---------- helper to re-run reveal after dynamic content loads ---------- */
  function reanimate() { runRevealAnimations(); initTilt(); }
  window.reanimate = reanimate; // expose for debugging if needed

}); // DOMContentLoaded end
