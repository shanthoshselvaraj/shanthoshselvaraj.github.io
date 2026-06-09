/* ==========================================================================
   Atmospheric Index — Visual Logic
   Canvases run continuously. JS manages the hover state switching for backgrounds.
   ========================================================================== */

(function () {

  /* ── Interaction Logic ── */
  function initAtmosHover() {
    var menu = document.getElementById('atmos-menu');
    var items = document.querySelectorAll('.atmos-item');
    if (!items.length || !menu) return;

    items.forEach(function (item) {
      // ONLY trigger on intentional physical mouse movement
      item.addEventListener('mousemove', function () {
        if (!this.classList.contains('is-hovered')) {
          // Clear others first (safety)
          items.forEach(function(i) {
             i.classList.remove('is-hovered');
             var tid = i.getAttribute('data-target');
             var v = document.getElementById('atmos-' + tid);
             if (v) v.classList.remove('is-active');
          });

          this.classList.add('is-hovered');
          menu.classList.add('has-hover');

          var targetId = this.getAttribute('data-target');
          var visual = document.getElementById('atmos-' + targetId);
          if (visual) visual.classList.add('is-active');
        }
      });

      item.addEventListener('mouseleave', function () {
        this.classList.remove('is-hovered');
        menu.classList.remove('has-hover');

        var targetId = this.getAttribute('data-target');
        var visual = document.getElementById('atmos-' + targetId);
        if (visual) visual.classList.remove('is-active');
      });
    });
  }

  /* ── Canvas Visuals ── */
  function initDLPVisual() {
    var container = document.getElementById('atmos-dlp');
    if (!container) return;

    var canvas = document.createElement('canvas');
    container.appendChild(canvas);

    function resize() {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resize();

    var ctx = canvas.getContext('2d');
    var STREAMS = 25;

    function makeStreams() {
      var W = canvas.width, H = canvas.height;
      return Array.from({ length: STREAMS }, function (_, i) {
        var y = (H / STREAMS) * i + (H / STREAMS / 2);
        return {
          y: y,
          speed: 0.5 + Math.random() * 0.4,
          particles: Array.from({ length: 12 }, function () {
            return {
              x: Math.random() * W,
              w: 20 + Math.random() * 60,
              opacity: 0.08 + Math.random() * 0.15,
              intercepted: Math.random() < 0.25,
              interceptX: W * 0.4 + Math.random() * W * 0.3,
              done: false
            };
          })
        };
      });
    }

    var streams = makeStreams();
    var raf;

    function draw() {
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      streams.forEach(function (stream) {
        stream.particles.forEach(function (p) {
          p.x += stream.speed;

          if (p.done) {
            if (p.x > W + p.w) {
              p.x = -p.w;
              p.done = false;
              p.interceptX = canvas.width * 0.4 + Math.random() * canvas.width * 0.3;
            }
            return;
          }

          if (p.x > W + p.w) { p.x = -p.w; }

          var alpha = p.opacity;
          var isRust = false;

          if (p.intercepted) {
            if (p.x > p.interceptX - 40 && p.x < p.interceptX + 40) {
              var fade = 1 - Math.abs(p.x - (p.interceptX - 20)) / 60;
              // Boost opacity of the rust particle so it's clearly visible during interception
              alpha = Math.max(0.18, fade * 0.9);
              isRust = true;
            } else if (p.x >= p.interceptX + 40) {
              p.done = true;
              return;
            }
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = isRust ? 'rgba(184,92,56,1)' : 'rgba(240,237,232,0.7)';
          ctx.beginPath();
          ctx.roundRect(p.x, stream.y - 1, p.w, 2, 1);
          ctx.fill();
        });
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      resize();
      streams = makeStreams();
      draw();
    });
  }

  function initGuardiumVisual() {
    var container = document.getElementById('atmos-guardium');
    if (!container) return;

    var canvas = document.createElement('canvas');
    container.appendChild(canvas);

    function resize() {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resize();

    var ctx = canvas.getContext('2d');
    var lines = 35;
    var speed = 0.4;
    var offset = 0;

    var raf;

    // ── Triage state machine ──────────────────────────────────────────────────
    // States: 'idle' → 'active' → 'idle' → ...
    // One line lights up in rust, travels to horizon, fades. Then silence.
    var triage = {
      state: 'idle',
      lineIndex: 0,       // which of the -lines..+lines indices is active
      progress: 0,        // 0 = full line visible at bottom, 1 = merged at horizon
      opacity: 0,         // current rust opacity (fades in, holds, fades out)
      silenceTimer: 0,    // frames to wait before next activation
      SILENCE_MIN: 20,    // rapid firing pause: min ~0.33s
      SILENCE_MAX: 55,    // rapid firing pause: max ~0.9s
      RISE_SPEED: 0.022,  // fast energetic travel (bottom to top in ~0.75s)
    };

    var lastLineIndex = null;
    var wasActive = false;

    function scheduleNextTriage() {
      triage.state = 'idle';
      triage.opacity = 0;
      triage.progress = 0;
      triage.silenceTimer = triage.SILENCE_MIN +
        Math.floor(Math.random() * (triage.SILENCE_MAX - triage.SILENCE_MIN));
    }

    function activateTriage() {
      var nextIndex;
      var attempts = 0;
      // Guarantee the next line is far enough away from the last line
      do {
        nextIndex = Math.floor(Math.random() * (lines * 2 - 4)) - (lines - 2);
        attempts++;
      } while (
        lastLineIndex !== null && 
        Math.abs(nextIndex - lastLineIndex) < 5 && // Must not be the same or adjacent 4 lines
        attempts < 30
      );

      triage.lineIndex = nextIndex;
      lastLineIndex = nextIndex;
      triage.progress = 0;
      triage.opacity = 0;
      triage.state = 'active';
    }

    scheduleNextTriage();

    function draw() {
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      var cx = W / 2;
      var cy = H * 0.25;

      // ── Detect active state transition to trigger instant pulse on hover start ──
      var isActive = container.classList.contains('is-active');
      if (isActive && !wasActive) {
        activateTriage();
      }
      wasActive = isActive;

      // ── Update triage state ───────────────────────────────────────────────
      if (triage.state === 'idle') {
        triage.silenceTimer--;
        if (triage.silenceTimer <= 0) activateTriage();
      } else {
        triage.progress += triage.RISE_SPEED;

        // Fade in, hold, fade out as it approaches the horizon
        if (triage.progress < 0.15) {
          triage.opacity = triage.progress / 0.15;
        } else if (triage.progress < 0.75) {
          triage.opacity = 1;
        } else {
          triage.opacity = 1 - (triage.progress - 0.75) / 0.25;
        }

        if (triage.progress >= 1) scheduleNextTriage();
      }

      // ── Draw all vertical perspective lines ───────────────────────────────
      for (var i = -lines; i <= lines; i++) {
        var startX = cx + (i * W / lines);
        var xBottom = startX * 4 - cx * 3;
        var yBottom = H;

        var isActiveLine = triage.state === 'active' && i === triage.lineIndex;

        // Draw the standard grid line (always fully visible)
        ctx.beginPath();
        if (isActiveLine) {
          // Warm up the active triage channel base with a subtle rust tracer
          var baseAlpha = 0.09 + (0.16 - 0.09) * triage.opacity;
          ctx.strokeStyle = 'rgba(184, 92, 56, ' + baseAlpha + ')';
          ctx.lineWidth = 1.25;
        } else {
          ctx.strokeStyle = 'rgba(240, 237, 232, 0.09)';
          ctx.lineWidth = 1;
        }
        ctx.moveTo(cx, cy);
        ctx.lineTo(xBottom, yBottom);
        ctx.stroke();

        // Overlay the moving rust pulse on top of the active line (surges forward from horizon to foreground)
        if (isActiveLine) {
          var t = triage.progress;
          var pulseHalfLen = 0.22;
          var t1 = Math.max(0, t - pulseHalfLen);
          var t2 = Math.min(1, t + pulseHalfLen);

          // Reversed: Interpolates from vanishing point (cx, cy) to foreground (xBottom, yBottom)
          var x1 = cx + (xBottom - cx) * t1;
          var y1 = cy + (yBottom - cy) * t1;
          var x2 = cx + (xBottom - cx) * t2;
          var y2 = cy + (yBottom - cy) * t2;

          if (t2 > t1) {
            var peakRatio = (t - t1) / (t2 - t1);
            peakRatio = Math.max(0, Math.min(1, peakRatio));

            // Perfectly balanced in-between stroke: single crisp path with warmer rust and 0.8 max opacity
            var grad = ctx.createLinearGradient(x1, y1, x2, y2);
            var pulseAlpha = triage.opacity * 0.8;
            
            grad.addColorStop(0, 'rgba(184, 92, 56, 0)');
            grad.addColorStop(peakRatio, 'rgba(215, 95, 50, ' + pulseAlpha + ')');
            grad.addColorStop(1, 'rgba(184, 92, 56, 0)');

            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8; // Perfectly balanced crisp width
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // ── Horizontal forward-motion lines (always pure off-white) ───────────
      offset = (offset + speed) % 20;

      for (var j = 0; j < 50; j++) {
        var trueJ = j + (offset / 20);
        var yPos = cy + Math.pow(trueJ, 2.3) * 0.3;

        if (yPos > H) break;

        var alpha = Math.min(1, (yPos - cy) / 40) * 0.15;
        if (alpha > 0.01) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(240, 237, 232, ' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.moveTo(0, yPos);
          ctx.lineTo(W, yPos);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  function initSAPVisual() {
    var container = document.getElementById('atmos-sap');
    if (!container) return;

    var canvas = document.createElement('canvas');
    container.appendChild(canvas);

    function resize() {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resize();

    var ctx = canvas.getContext('2d');
    
    var time = 0;
    var raf;

    function draw() {
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      time += 0.0015;
      
      var cx = W * 0.6;
      var cy = H * 0.7;
      
      ctx.lineWidth = 1.5;
      var timeScale = time * 35;
      
      // Massive rippling global contours
      for(var i = 0; i <= 25; i++) {
        var r = (i * 120) + (timeScale % 120); 
        
        // Fade in at center, fade out at edges
        var alpha = Math.min(1, r / 80) * Math.max(0, 1 - r / (W * 1.1)) * 0.12;
        
        if (alpha > 0) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(240, 237, 232, ' + alpha + ')';
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      // Secondary structural pivot
      var cx2 = W * 0.25;
      var cy2 = H * 0.2;
      for(var j = 0; j <= 15; j++) {
        var r2 = (j * 160) + ((timeScale * 0.8) % 160);
        // Boost the multiplier from 0.06 to 0.28 to make the secondary rust ripples visible
        var alpha2 = Math.min(1, r2 / 100) * Math.max(0, 1 - r2 / (W * 0.8)) * 0.28;
        
        if (alpha2 > 0) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(184, 92, 56, ' + alpha2 + ')'; // Rust accent
          ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  /* ── Boot ── */
  function boot() {
    initAtmosHover();
    initDLPVisual();
    initGuardiumVisual();
    initSAPVisual();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
