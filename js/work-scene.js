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
              alpha = p.opacity * Math.max(0, fade);
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

    function draw() {
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      
      // High perspective horizon
      var cx = W / 2;
      var cy = H * 0.25; 
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(240, 237, 232, 0.12)';
      ctx.lineWidth = 1;

      // Vertical radiating perspective lines
      for (var i = -lines; i <= lines; i++) {
        var startX = cx + (i * W / lines);
        ctx.moveTo(cx, cy);
        ctx.lineTo(startX * 4 - cx*3, H); 
      }

      // Horizontal moving lines simulating forward motion
      offset = (offset + speed) % 20;
      
      for (var j = 0; j < 50; j++) {
        var trueJ = j + (offset / 20);
        // Exponential growth to simulate depth perspective
        var yPos = cy + Math.pow(trueJ, 2.3) * 0.3;
        
        if (yPos > H) break;
        
        // Fade in smoothly from the horizon
        var alpha = Math.min(1, (yPos - cy) / 40) * 0.15;
        if (alpha > 0.01) {
          ctx.stroke(); // Draw previous batch
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(240, 237, 232, ' + alpha + ')';
          ctx.moveTo(0, yPos);
          ctx.lineTo(W, yPos);
        }
      }
      ctx.stroke();

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
        var alpha2 = Math.min(1, r2 / 100) * Math.max(0, 1 - r2 / (W * 0.8)) * 0.06;
        
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
