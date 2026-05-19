/* ==========================================================================
   Showcase Video — Scroll-triggered playback & interaction
   ========================================================================== */
(function initShowcaseVideos() {
  function init() {
    var showcases = document.querySelectorAll('.showcase-video');
    if (!showcases.length) return;

    showcases.forEach(function (showcase) {
      var video   = showcase.querySelector('.showcase-video-el');
      var overlay = showcase.querySelector('.showcase-overlay');
      var playBtn = showcase.querySelector('.showcase-play-btn');
      if (!video || !overlay) return;

      var hasPlayed   = false;
      var isInView    = false;
      var userPaused  = false;

      // ── Lazy-load: start preloading when within 500px ──
      var preloadObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          video.preload = 'auto';
          preloadObs.disconnect();
        }
      }, { rootMargin: '500px 0px' });
      preloadObs.observe(showcase);

      // ── Scroll-triggered play ──
      var playObs = new IntersectionObserver(function (entries) {
        isInView = entries[0].isIntersecting;

        if (isInView && !hasPlayed) {
          // First time in view: auto-play
          hasPlayed = true;
          playVideo();
        } else if (isInView && !userPaused) {
          // Scrolled back into view after leaving
          video.play().catch(function () {});
        } else if (!isInView && !video.paused) {
          // Scrolled out of view: pause to save resources
          video.pause();
        }
      }, { threshold: 0.4 });
      playObs.observe(showcase);

      function playVideo() {
        video.play().then(function () {
          overlay.classList.add('hidden');
          showcase.classList.add('is-playing');
        }).catch(function () {
          // Autoplay blocked — user must click
        });
      }

      // ── Click overlay or play button to start ──
      overlay.addEventListener('click', function () {
        userPaused = false;
        playVideo();
      });

      // ── Click video to toggle pause/play ──
      video.addEventListener('click', function () {
        if (video.paused) {
          userPaused = false;
          video.play().catch(function () {});
          showcase.classList.add('is-playing');
        } else {
          userPaused = true;
          video.pause();
          showcase.classList.remove('is-playing');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
