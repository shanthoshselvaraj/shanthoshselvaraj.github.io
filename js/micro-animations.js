/* ==========================================================================
   Micro-Animations JavaScript - Phase 1
   Implements interactive animations following the design system
   "Expect the Unexpected" theme
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // MULTILINGUAL GREETING ANIMATION
  // ==========================================================================

  function initMultilingualGreeting() {
    const greetings = [
      { text: 'Hi', lang: 'en', duration: 3500 },
      { text: 'வணக்கம்', lang: 'ta', duration: 3500 }, // Tamil - Vanakkam
      { text: 'नमस्कार', lang: 'hi', duration: 3500 }, // Hindi - Namaskara
      { text: 'ನಮಸ್ಕಾರ', lang: 'kn', duration: 3500 }  // Kannada - Namaskara
    ];

    let currentIndex = 0;
    let animationTimeout;
    let isPaused = false;

    // Use existing greeting element from HTML
    const greetingDiv = document.getElementById('heroGreeting');
    if (!greetingDiv) return;

    // Move it before the hero name for proper positioning
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;

    heroName.parentNode.insertBefore(greetingDiv, heroName);
    greetingDiv.setAttribute('aria-live', 'polite');

    // Typewriter effect
    function typeText(text, callback) {
      greetingDiv.classList.add('typing');
      let charIndex = 0;
      greetingDiv.textContent = '';

      function typeChar() {
        if (charIndex < text.length) {
          greetingDiv.textContent += text[charIndex];
          charIndex++;
          setTimeout(typeChar, 80);
        } else {
          greetingDiv.classList.remove('typing');
          if (callback) callback();
        }
      }

      typeChar();
    }

    // Animate greeting transition
    function animateGreeting() {
      if (isPaused) return;

      const greeting = greetings[currentIndex];

      // Fade out current text
      greetingDiv.style.animation = 'greetingFadeOut 0.3s forwards';

      setTimeout(() => {
        greetingDiv.setAttribute('lang', greeting.lang);
        greetingDiv.style.animation = 'greetingFadeIn 0.3s forwards';

        // Type new greeting
        typeText(greeting.text, () => {
          // Schedule next greeting
          animationTimeout = setTimeout(() => {
            currentIndex = (currentIndex + 1) % greetings.length;
            animateGreeting();
          }, greeting.duration);
        });
      }, 300);
    }

    // Pause on hover
    greetingDiv.addEventListener('mouseenter', () => {
      isPaused = true;
      clearTimeout(animationTimeout);
    });

    greetingDiv.addEventListener('mouseleave', () => {
      isPaused = false;
      animationTimeout = setTimeout(() => {
        currentIndex = (currentIndex + 1) % greetings.length;
        animateGreeting();
      }, 2000);
    });

    // Start animation after initial page load
    setTimeout(() => {
      animateGreeting();
    }, 1500);
  }

  // ==========================================================================
  // STATS GRID PARTICLE EFFECTS
  // ==========================================================================

  function initStatsParticles() {
    const statCells = document.querySelectorAll('.hero-stat-cell');

    statCells.forEach(cell => {
      // Create particle container
      const particleContainer = document.createElement('div');
      particleContainer.className = 'stat-particles';
      cell.appendChild(particleContainer);

      // Generate particles on hover
      cell.addEventListener('mouseenter', () => {
        createParticles(particleContainer);
      });
    });
  }

  function createParticles(container) {
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'stat-particle';

      // Random starting position near the stat number
      const startX = 50 + (Math.random() - 0.5) * 40;
      const startY = 50;

      particle.style.left = startX + '%';
      particle.style.bottom = startY + '%';

      container.appendChild(particle);

      // Animate particle
      const duration = 1000 + Math.random() * 500;
      const distance = 30 + Math.random() * 20;
      const drift = (Math.random() - 0.5) * 20;

      particle.animate([
        {
          transform: 'translate(0, 0)',
          opacity: 0
        },
        {
          transform: `translate(${drift}px, -${distance}px)`,
          opacity: 0.8,
          offset: 0.3
        },
        {
          transform: `translate(${drift * 1.5}px, -${distance * 1.5}px)`,
          opacity: 0
        }
      ], {
        duration: duration,
        easing: 'cubic-bezier(.25, .46, .45, .94)',
        fill: 'forwards'
      }).onfinish = () => {
        particle.remove();
      };
    }
  }

  // ==========================================================================
  // LIVING CURSOR COMPANION - Replaced by Unified Eye Cursor System
  // ==========================================================================

  // ==========================================================================
  // NAVIGATION ENHANCEMENTS
  // ==========================================================================

  function initNavigationEnhancements() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
      // Enhanced hover effect
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-1px)';
      });

      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0)';
      });
    });

    // Logo magnetic effect
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      logo.addEventListener('mousemove', (e) => {
        const rect = logo.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 50;

        if (distance < maxDistance) {
          const strength = (maxDistance - distance) / maxDistance;
          const moveX = x * strength * 0.3;
          const moveY = y * strength * 0.3;

          logo.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });

      logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'translate(0, 0)';
      });
    }
  }

  // ==========================================================================
  // WORK CARDS ENHANCEMENTS
  // ==========================================================================

  function initWorkCardEnhancements() {
    const workCards = document.querySelectorAll('.home-work-card');

    workCards.forEach(card => {
      // Add subtle tilt on hover
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * -2;
        const rotateY = (x - centerX) / centerX * 2;

        card.style.transform = `
          translateY(-4px) 
          perspective(1000px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
      });
    });
  }

  // ==========================================================================
  // FRAMEWORK ROWS — STAGGERED SCENE REVEAL
  // ==========================================================================

  function initFrameworkCards() {
    const frameworkRows = document.querySelectorAll('.framework-card');
    if (!frameworkRows.length) return;

    // Helper: set initial hidden state
    function hide(el, ty) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(' + (ty || 16) + 'px)';
      el.style.transition = 'opacity 0.65s cubic-bezier(.25,.46,.45,.94), transform 0.65s cubic-bezier(.25,.46,.45,.94)';
    }

    // Helper: reveal with delay
    function reveal(el, delay) {
      if (!el) return;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay);
    }

    // Set initial hidden states on all animated children
    frameworkRows.forEach(row => {
      hide(row.querySelector('.hollow-number'), 24);
      hide(row.querySelector('.framework-title'), 16);
      hide(row.querySelector('.framework-desc'), 12);
      hide(row.querySelector('.metric-primary-value'), 12);
      hide(row.querySelector('.metric-primary-label'), 8);
      row.querySelectorAll('.metric-stat').forEach(s => hide(s, 8));
    });

    // Staggered reveal on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const row = entry.target;

        reveal(row.querySelector('.hollow-number'), 0);
        reveal(row.querySelector('.framework-title'), 140);
        reveal(row.querySelector('.framework-desc'), 240);
        reveal(row.querySelector('.metric-primary-value'), 360);
        reveal(row.querySelector('.metric-primary-label'), 420);

        row.querySelectorAll('.metric-stat').forEach((s, i) => {
          reveal(s, 460 + i * 80);
        });

        observer.unobserve(row);
      });
    }, { threshold: 0.15 });

    frameworkRows.forEach(row => observer.observe(row));
  }

  // ==========================================================================
  // ABOUT — DEPTH LAYER CINEMATIC SEQUENCE
  // ==========================================================================

  function initAboutCinematic() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('.about-section');
    if (!section) return;

    const ghost = section.querySelector('.about-ghost');
    const spine = section.querySelector('.about-spine');
    const photoWrap = section.querySelector('.about-photo-wrap');
    const photo = section.querySelector('.about-photo');
    const nameEl = section.querySelector('.about-photo-name');
    const rule = section.querySelector('.about-rule');
    const words = section.querySelectorAll('.about-word');
    const mentorRule = section.querySelector('.about-mentor-rule');
    const body = section.querySelector('.about-body');


    // Set words to initial hidden state — GSAP owns this, not CSS
    gsap.set(words, { opacity: 0, filter: 'blur(14px) brightness(0.2)', y: 18 });
    gsap.set(body,  { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: 'top top',
        scrub: 1.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // Beat 1: Spine reveal
    // tl.to(spine, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.5);

    // Beat 2: Rule + Words reveal (word by word)
    tl.to(rule, { scaleX: 1, opacity: 0.7, duration: 1, ease: 'power3.out' }, 1.5);
    words.forEach((word, i) => {
      tl.to(word, {
        opacity: 1, filter: 'blur(0px) brightness(1)', y: 0,
        duration: 0.6, ease: 'power2.out',
      }, 1.8 + i * 0.5);
    });

    // Beat 3: Body text reveal
    tl.to(body, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 3.5);

    // Photo arrives
    tl.to(photoWrap, { opacity: 1, duration: 0.4, ease: 'none' }, 5.9);
    tl.to(photo, {
      filter: 'grayscale(100%) contrast(1.1) brightness(1)',
      duration: 1.8, ease: 'power2.inOut',
    }, 6.3);
    tl.to(nameEl, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 7.8);

    // Beat 4: Mentor rule
    tl.to(mentorRule, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 8.5);
  }

  // ==========================================================================
  // ABOUT — GRAIN PARTICLE FIELD
  // 18 rust-tinted particles. Ambient drift by default.
  // Glacial gravitational pull toward cursor once section enters view.
  // ==========================================================================

  function initAboutGrain() {
    const section = document.querySelector('.about-section');
    if (!section) return;

    const canvas = section.querySelector('.about-grain-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    // Track cursor in viewport coords; update canvas rect on move + resize
    let mouseVX = window.innerWidth  / 2;
    let mouseVY = window.innerHeight / 2;
    let canvasRect = { left: 0, top: 0 };

    // Resize canvas — deferred so layout is fully computed
    function resize() {
      W = canvas.width  = section.offsetWidth  || window.innerWidth;
      H = canvas.height = section.offsetHeight || window.innerHeight;
      canvasRect = canvas.getBoundingClientRect();
    }
    // First resize after paint; second on full layout stabilise
    requestAnimationFrame(() => { resize(); requestAnimationFrame(resize); });
    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('mousemove', (e) => {
      mouseVX = e.clientX;
      mouseVY = e.clientY;
      canvasRect = canvas.getBoundingClientRect();
    }, { passive: true });

    // Particle pull activates once the section enters the viewport
    let isActive = false;
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        onEnter:     () => { isActive = true;  },
        onEnterBack: () => { isActive = true;  },
      });
    } else {
      isActive = true;
    }

    // Build particles
    const PARTICLE_COUNT = 18;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * (W  || window.innerWidth),
      y:  Math.random() * (H  || window.innerHeight),
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r:  0.8 + Math.random() * 1.2,
      op: 0.06 + Math.random() * 0.12,
    }));

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Cursor in canvas-local space
      const cx = mouseVX - canvasRect.left;
      const cy = mouseVY - canvasRect.top;

      particles.forEach(p => {
        if (isActive) {
          const dx   = cx - p.x;
          const dy   = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist > 30) {
            // Glacial attraction — tiny, distance-scaled force
            const force = 0.00012 * dist;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          } else {
            // Soft repulsion right at the cursor so particles orbit, not collapse
            p.vx -= (dx / dist) * 0.018;
            p.vy -= (dy / dist) * 0.018;
          }

          // Damping keeps speed glacially slow
          p.vx *= 0.97;
          p.vy *= 0.97;

          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 0.55) { p.vx = (p.vx / speed) * 0.55; p.vy = (p.vy / speed) * 0.55; }

        } else {
          // Ambient drift before section is in view
          p.vx += (Math.random() - 0.5) * 0.014;
          p.vy += (Math.random() - 0.5) * 0.014;
          p.vx *= 0.99;
          p.vy *= 0.99;

          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 0.28) { p.vx = (p.vx / speed) * 0.28; p.vy = (p.vy / speed) * 0.28; }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Soft wrap at edges
        if (p.x < -10)    p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10)    p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 92, 56, ${p.op})`;
        ctx.fill();
      });

      requestAnimationFrame(tick);
    }

    tick();
  }

  // ==========================================================================
  // ABOUT CHAPTER — Single unified timeline
  // ACT 1 : Kinetic chorus (each quote focuses then recedes)
  // BRIDGE: All quotes blur back to atmospheric field
  // ACT 2 : Portrait reveal (words → body → photo)
  // ==========================================================================

  function initAboutChapter() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('.about-section');
    if (!section) return;

    // ACT 1 elements
    const quotes = gsap.utils.toArray('.ac-quote', section);
    if (!quotes.length) return;

    // ACT 2 elements
    const photoWrap= section.querySelector('.about-photo-wrap');
    const photo    = section.querySelector('.about-photo');
    const nameEl   = section.querySelector('.about-photo-name');
    const words    = section.querySelectorAll('.about-word');
    const body     = section.querySelector('.about-body');
    const mentor   = section.querySelector('.about-mentor-text');

    // ── Initial states ──────────────────────────────────────────────────────
    // Quotes: match CSS atmospheric state (gsap.set overrides the CSS values for GSAP to own)
    gsap.set(quotes,    { opacity: 0.13, filter: 'blur(14px)', scale: 0.95, y: 0 });
    gsap.set(words,     { opacity: 0, filter: 'blur(14px) brightness(0.2)', y: 18 });
    gsap.set(body,      { opacity: 0 });
    gsap.set(mentor,    { opacity: 0 });
    gsap.set(photoWrap, { opacity: 0, y: 60 });
    gsap.set(nameEl,    { opacity: 0 });

    // ── Master timeline ──────────────────────────────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: 'top top',
        end: '+=900%',
        scrub: 1,           // same as the old smooth chorus
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // ── ACT 1: Kinetic chorus ────────────────────────────────────────────────
    // Pure tl.to from pre-set state → focus → back to atmospheric.
    // Parallax y drift runs as a separate fromTo on y only (smooth with scrub).
    // Each quote: 0.2 of timeline (normalized). 5 quotes = full 0→1.
    const STAGGER = 1 / quotes.length; // 0.2 per quote

    quotes.forEach((quote, i) => {
      const start = i * STAGGER;

      // Focus in
      tl.to(quote, {
        opacity: 1, filter: 'blur(0px)', scale: 1.04,
        duration: STAGGER * 0.4, ease: 'power2.inOut',
      }, start);

      // Recede back to atmospheric state
      tl.to(quote, {
        opacity: 0.13, filter: 'blur(14px)', scale: 0.95,
        duration: STAGGER * 0.4, ease: 'power2.inOut',
      }, start + STAGGER * 0.6);

      // Parallax float — y travels full quote duration, same as old chorus
      tl.fromTo(quote,
        { y: 55 },
        { y: -55, duration: STAGGER, ease: 'none' },
        start
      );
    });

    // ACT 1 ends at t=1.0 (normalized end of 5 quotes)
    const ACT1_END = 1.0;

    // ── BRIDGE: All quotes settle to near-invisible field ────────────────────
    // Collective blur. The silence. Fast.
    const BRIDGE = ACT1_END + 0.02;
    tl.to(quotes, {
      opacity: 0.35, filter: 'blur(24px)', scale: 0.92,
      duration: 0.8, ease: 'power3.inOut',
      stagger: 0.01,
    }, BRIDGE);

    // ── ACT 2: Portrait reveal ───────────────────────────────────────────────
    // Quotes stay as dim atmospheric field. About content forms out of silence.
    const A2 = BRIDGE + 0.12; // brief held silence after bridge

    // Words: darkroom clarify one by one
    words.forEach((w, i) => {
      tl.to(w, {
        opacity: 1, filter: 'blur(0px) brightness(1)', y: 0,
        duration: 0.06, ease: 'power2.out',
      }, A2 + i * 0.055);
    });

    const wordsEnd = A2 + (words.length - 1) * 0.055 + 0.06;

    tl.to(body,   { opacity: 1, duration: 0.07, ease: 'power2.out' }, wordsEnd + 0.03);
    tl.to(mentor, { opacity: 1, duration: 0.06, ease: 'power2.out' }, wordsEnd + 0.08);

    // Photo — the climax
    const PHOTO = wordsEnd + 0.14;
    tl.to(photoWrap, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, PHOTO);
    tl.to(photo, {
      filter: 'grayscale(100%) contrast(1.1) brightness(1)',
      duration: 0.18, ease: 'power2.inOut',
    }, PHOTO + 0.04);
    tl.to(nameEl, { opacity: 1, duration: 0.06, ease: 'power2.out' }, PHOTO + 0.2);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    // Check if we're on the home page
    const homePage = document.getElementById('page-home');
    if (!homePage || !homePage.classList.contains('active')) return;

    // Initialize all animations
    initMultilingualGreeting();
    initStatsParticles();
    initNavigationEnhancements();
    initWorkCardEnhancements();
    initFrameworkCards();
    initAboutChapter();

    console.log('✨ Phase 1 micro-animations initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize when navigating back to home
  window.addEventListener('popstate', () => {
    setTimeout(init, 100);
  });

})();

