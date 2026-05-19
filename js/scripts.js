window.goTo = function (id, anchor) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
  var target = document.getElementById('page-' + id);
  if (target) { target.classList.add('active'); }
  window.scrollTo(0, 0);
  if (anchor) {
    setTimeout(function () {
      var el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.classList.remove('active'); });
  if (id === 'home') { var nh = document.getElementById('nav-home'); if (nh) nh.classList.add('active'); }
  if (id.indexOf('case') === 0) { var nw = document.getElementById('nav-work'); if (nw) nw.classList.add('active'); }
  setTimeout(initReveal, 60);
};

function initReveal() {
  var els = document.querySelectorAll('.page.active .reveal');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
  els.forEach(function (el) { el.classList.remove('visible'); obs.observe(el); });
  setTimeout(function () {
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 80) el.classList.add('visible');
    });
  }, 50);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}


var statsObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.stat-number[data-target]').forEach(function (el) {
      var target = +el.dataset.target, suffix = el.dataset.suffix || '', start;
      (function step(ts) { if (!start) start = ts; var p = Math.min((ts - start) / 1200, 1); var eased = 1 - Math.pow(1 - p, 3); el.textContent = Math.floor(eased * target) + suffix; if (p < 1) requestAnimationFrame(step); })(performance.now());
    });
    statsObs.unobserve(e.target);
  });
}, {
  threshold: 0
});
var hs = document.getElementById('heroStats');
if (hs) statsObs.observe(hs);

// ── Nav visibility: hide on hero, reveal on scroll past ──────────────────────
(function initNavVisibility() {
  var nav = document.getElementById('mainNav');
  var hero = document.querySelector('.hero');
  if (!nav || !hero) return;

  var heroObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        // Hero visible — hide the nav
        nav.classList.remove('nav--visible');
      } else {
        // Hero out of view — show the nav
        nav.classList.add('nav--visible');
      }
    });
  }, { threshold: 0.1 });

  heroObs.observe(hero);
})();

// ── Smooth scroll for all hash links ─────────────────────────────────────────
document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;

  var hash = link.getAttribute('href');

  // Home / logo — scroll to top
  if (hash === '#' || hash === '') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  var target = document.querySelector(hash);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Active nav state on scroll ────────────────────────────────────────────────
(function initActiveNav() {
  var sections = [
    { id: 'work-preview',  navId: 'nav-work'       },
    { id: 'frameworks',    navId: 'nav-frameworks'  },
    { id: 'about',         navId: 'nav-about'       },
    { id: 'contact',       navId: 'nav-cta'         }
  ];

  var navLinks = document.querySelectorAll('.nav-links a');

  function clearActive() {
    navLinks.forEach(function (a) { a.classList.remove('active'); });
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var match = sections.find(function (s) { return s.id === entry.target.id; });
      if (match) {
        clearActive();
        var activeLink = document.getElementById(match.navId);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  // Observe each section; also watch the hero to restore "Home" active state
  var hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        clearActive();
        var homeLink = document.getElementById('nav-home');
        if (homeLink) homeLink.classList.add('active');
      }
    }, { threshold: 0.3 }).observe(hero);
  }

  sections.forEach(function (s) {
    var el = document.getElementById(s.id);
    if (el) obs.observe(el);
  });
})();


// Border-color tint on scroll
window.addEventListener('scroll', function () {
  var nav = document.getElementById('mainNav');
  if (nav) nav.style.borderBottomColor = window.scrollY > 40 ? 'rgba(184,92,56,0.15)' : 'rgba(240,237,232,0.08)';
});




// ── Cinematic Snap: Hero ↔ Work ↔ Frameworks (Rigid Interceptor) ─────────────
// Reverting to strict wheel interception, but with an iron-clad cooldown timer 
// to prevent Apple trackpad momentum from chaining animations together.
// No in-between states. Instant lock.
(function initSnapScroll() {
  function init() {
    var work       = document.getElementById('work-preview');
    var hero       = document.querySelector('.hero');
    var frameworks = document.getElementById('frameworks');
    if (!work || !hero || !frameworks) return;

    var isSnapping    = false;
    var lastSnapTime  = 0;
    var SNAP_COOLDOWN = 1200; // ms (800ms animation + 400ms to ignore momentum)
    var SNAP_DURATION = 800;  // ms
    var THRESHOLD     = 25;   // px — generous catch area for trackpad settling

    function getWorkTop() {
      return Math.round(work.getBoundingClientRect().top + window.scrollY);
    }
    function getFrameworksTop() {
      return Math.round(frameworks.getBoundingClientRect().top + window.scrollY);
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function snapTo(targetPos) {
      if (isSnapping || Date.now() - lastSnapTime < SNAP_COOLDOWN) return;
      
      var start    = window.scrollY;
      var distance = targetPos - start;
      if (Math.abs(distance) < 5) return;

      isSnapping = true;
      var startTime = null;

      function step(now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / SNAP_DURATION, 1);
        var eased    = easeInOutCubic(progress);
        
        window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          isSnapping = false;
          lastSnapTime = Date.now(); // Start momentum cooldown AFTER landing
        }
      }
      requestAnimationFrame(step);
    }

    // ── Wheel ─────────────────────────────────────────────────────────────────
    window.addEventListener('wheel', function (e) {
      if (isSnapping) { e.preventDefault(); return; }
      if (Date.now() - lastSnapTime < SNAP_COOLDOWN) return;

      var scrollY       = window.scrollY;
      var workTop       = getWorkTop();
      var frameworksTop = getFrameworksTop();

      // 1. Forward: Hero -> Work (Instant Snap)
      // If we are above Work and scrolling DOWN
      if (scrollY < workTop - THRESHOLD && e.deltaY > 0) {
        e.preventDefault(); 
        snapTo(workTop);
      }
      
      // 2. Backward: Frameworks -> Work (Instant Snap)
      // If we are anywhere from Frameworks top up through the bottom of Work, and scrolling UP
      else if (scrollY > workTop + THRESHOLD && scrollY <= frameworksTop + THRESHOLD && e.deltaY < 0) {
        e.preventDefault(); 
        snapTo(workTop);
      }
      
      // 3. Forward: Work -> Frameworks (Glide)
      // (Handled automatically because no rule intercepts deltaY > 0 when scrollY >= workTop)
      
      // 4. Backward: Work -> Hero (Glide)
      // (Handled automatically because no rule intercepts deltaY < 0 when scrollY <= workTop + THRESHOLD)

    }, { passive: false });

    // ── Keyboard ──────────────────────────────────────────────────────────────
    window.addEventListener('keydown', function (e) {
      if (isSnapping || Date.now() - lastSnapTime < SNAP_COOLDOWN) return;

      var scrollY       = window.scrollY;
      var workTop       = getWorkTop();
      var frameworksTop = getFrameworksTop();

      var isDown = (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ');
      var isUp   = (e.key === 'ArrowUp'   || e.key === 'PageUp');

      // 1. Forward: Hero -> Work (Instant Snap)
      if (scrollY < workTop - THRESHOLD && isDown) {
        e.preventDefault(); 
        snapTo(workTop);
      }
      // 2. Backward: Frameworks -> Work (Instant Snap)
      else if (scrollY > workTop + THRESHOLD && scrollY <= frameworksTop + THRESHOLD && isUp) {
        e.preventDefault(); 
        snapTo(workTop);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();




// Before/After Slider Component
(function initBeforeAfterSliders() {
  function initSlider(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const beforeWrapper = container.querySelector('.before-image-wrapper');
    const divider = container.querySelector('.slider-divider');
    let isDragging = false;

    function updateSlider(x) {
      const rect = container.getBoundingClientRect();
      const offsetX = x - rect.left;
      const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));

      beforeWrapper.style.width = percentage + '%';
      divider.style.left = percentage + '%';
    }

    function handleMouseDown(e) {
      isDragging = true;
      updateSlider(e.clientX);
      e.preventDefault();
    }

    function handleMouseMove(e) {
      if (!isDragging) return;
      updateSlider(e.clientX);
      e.preventDefault();
    }

    function handleMouseUp() {
      isDragging = false;
    }

    function handleTouchStart(e) {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
      e.preventDefault();
    }

    function handleTouchMove(e) {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
      e.preventDefault();
    }

    function handleTouchEnd() {
      isDragging = false;
    }

    // Mouse events
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }

  // Initialize all sliders when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initSlider('slider-list');
      initSlider('slider-panel');
    });
  } else {
    initSlider('slider-list');
    initSlider('slider-panel');
  }
})();
