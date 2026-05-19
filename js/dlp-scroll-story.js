document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const container = document.getElementById('dlp-container');
  if (!container) return;

  // Bridge text animation: 100% GPU accelerated scale and crossfade to prevent dropped frames
  const bridgeTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scroll-story-wrapper',
      start: 'top bottom',
      end: 'top 30%',
      scrub: true
    }
  });
  
  bridgeTl.to('#dlp-bridge-container', { scale: 1.5, duration: 1 }, 0);
  bridgeTl.to('#dlp-bridge-normal', { opacity: 0, duration: 1 }, 0);
  bridgeTl.to('#dlp-bridge-bold', { opacity: 1, duration: 1 }, 0);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#dlp-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1
    }
  });

  const viewportEl = document.getElementById('dlp-viewport');
  const vw = viewportEl.offsetWidth || window.innerWidth;
  const vh = viewportEl.offsetHeight || window.innerHeight;
  
  const browserActualW = document.getElementById('dlp-shared-browser').offsetWidth || Math.min(700, vw * 0.84);
  const targetW = Math.min(420, vw * 0.45);
  const matchScale = targetW / browserActualW;

  const laptopActualW = document.getElementById('dlp-shared-laptop').offsetWidth || Math.min(460, vw * 0.45);
  const laptopScale = targetW / laptopActualW;

  const caption = document.getElementById('dlp-caption');

  function P(v) { return v * 93; }

  // We are relying less on bottom captions, but keeping the helper just in case
  function setCap(text, time) {
    if (!text) {
      tl.to(caption, { opacity: 0, duration: P(0.01) }, P(time));
    } else {
      tl.to(caption, { opacity: 0, duration: P(0.01) }, P(time - 0.015));
      tl.call(() => caption.textContent = text, null, P(time - 0.005));
      tl.fromTo(caption, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: P(0.01) }, P(time));
    }
  }

  function buildDecipher(elId, word) {
    const el = document.getElementById(elId);
    if(!el) return [];
    const chars = [];
    for (let i = 0; i < word.length; i++) {
      const span = document.createElement('span');
      span.className = 'decrypt-char';
      span.textContent = '0';
      if (word[i] === ' ') span.style.minWidth = '16px'; 
      el.appendChild(span);
      chars.push(span);
    }
    return chars;
  }

  function runDecipher(tl, chars, word, startTime) {
    const hex = "0123456789ABCDEF";
    tl.to({}, {
      duration: P(0.04),
      onUpdate: function () {
        const progress = this.progress();
        chars.forEach((char, i) => {
          // Multiply threshold by 0.7 so the last char triggers at ~0.7, well before progress hits 1.0
          const threshold = (i / chars.length) * 0.7;
          if (progress > threshold + 0.1 || word[i] === ' ') {
            char.textContent = word[i];
            char.style.color = "var(--text-primary)";
          } else {
            char.textContent = hex[Math.floor(Math.random() * hex.length)];
            char.style.color = "rgba(240,237,232,0.3)";
          }
        });
      }
    }, P(startTime));
  }

  const samsungChars = buildDecipher('dlp-decipher-samsung-text', "SAMSUNG");
  const rockstarChars = buildDecipher('dlp-decipher-rockstar-text', "ROCKSTAR GAMES");
  const attChars = buildDecipher('dlp-decipher-att-text', "AT&T");
  const changeChars = buildDecipher('dlp-decipher-change-text', "CHANGE HEALTHCARE");

  gsap.set('.dlp-stage-scene', { opacity: 0 });

  /* ==========================================
     SCENE 1: THE TRIGGER (0.01 - 0.05)
     ========================================== */
  gsap.set('#dlp-shared-browser', { scale: 1, opacity: 1 });
  // Turn rust
  tl.to('#dlp-h1-rust', { color: 'var(--rust)', duration: P(0.02) }, P(0.03));

  /* ==========================================
     SCENE 2: THE RECOGNITION (0.06 - 0.13)
     ========================================== */
  tl.to('#dlp-shared-browser', { left: '25%', scale: matchScale, duration: P(0.04), ease: 'power2.inOut' }, P(0.06));
  
  gsap.set('#dlp-shared-laptop', { left: '75%', scale: laptopScale });
  tl.fromTo('#dlp-shared-laptop', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: P(0.02), ease: 'power2.out' }, P(0.08));
  
  // Cinematic statement replaces old caption
  tl.fromTo('#dlp-stmt-engineers', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.015) }, P(0.09));
  tl.to('#dlp-stmt-engineers', { opacity: 0, duration: P(0.01) }, P(0.12));

  /* ==========================================
     VIGNETTE 1: SAMSUNG
     ========================================== */
  // 1A. THE STORY: ChatGPT Formation (0.16 - 0.28)
  
  // Fade out Browser & Laptop first — clean dark stage
  tl.to(['#dlp-shared-browser', '#dlp-shared-laptop'], { opacity: 0, duration: P(0.02) }, P(0.13));
  setCap(null, 0.13);
  
  tl.set('#dlp-scene-nodes', { opacity: 1 }, P(0.16));
  
  // --- Scatter nodes ---
  const nodesContainer = document.getElementById('dlp-chatgpt-nodes-container');
  const scatterNodes = [];
  const NODE_COUNT = 24;
  
  for (let i = 0; i < NODE_COUNT; i++) {
    const node = document.createElement('div');
    node.className = 'dlp-cgpt-node';
    const sx = 15 + Math.random() * 70;
    const sy = 10 + Math.random() * 80;
    node.style.left = sx + '%';
    node.style.top = sy + '%';
    node.style.opacity = '0';
    nodesContainer.appendChild(node);
    scatterNodes.push(node);
  }
  
  // Phase 1: Scatter nodes appear as chaotic cloud
  scatterNodes.forEach((n, i) => {
    tl.to(n, { opacity: 1, duration: P(0.002) }, P(0.165) + i * P(0.001));
  });
  
  // Phase 2: Nodes converge toward center and fade out
  scatterNodes.forEach((n) => {
    tl.to(n, {
      left: '50%',
      top: '50%',
      opacity: 0,
      duration: P(0.03),
      ease: 'power2.in'
    }, P(0.19));
  });
  
  // Phase 3: ChatGPT SVG logo draws itself in via stroke animation
  const chatgptPath = document.getElementById('dlp-chatgpt-path');
  const chatgptSvg = document.getElementById('dlp-chatgpt-svg');
  
  if (chatgptPath) {
    const pathLength = chatgptPath.getTotalLength();
    gsap.set(chatgptPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    
    // Fade in the SVG container
    tl.to(chatgptSvg, { opacity: 1, duration: P(0.01) }, P(0.20));
    
    // Draw the path
    tl.to(chatgptPath, {
      strokeDashoffset: 0,
      duration: P(0.04),
      ease: 'power1.inOut'
    }, P(0.21));
  }
  
  // Phase 4: Statements drift in below the logo
  tl.fromTo('#dlp-stmt-s1', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.015) }, P(0.25));
  tl.to('#dlp-stmt-s1', { opacity: 0, duration: P(0.01) }, P(0.27));
  
  tl.fromTo('#dlp-stmt-s2', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.015) }, P(0.275));
  tl.to('#dlp-stmt-s2', { opacity: 0, duration: P(0.01) }, P(0.295));

  tl.fromTo('#dlp-stmt-s3', { opacity: 0, y: 10, letterSpacing: '0.2em' }, { opacity: 1, y: 0, letterSpacing: '0.3em', duration: P(0.02) }, P(0.30));

  // Fade out
  tl.to('#dlp-scene-nodes', { opacity: 0, duration: P(0.02) }, P(0.34));

  // 1B. THE PUNCHLINE: Decipher (0.36 - 0.42)
  tl.set('#dlp-scene-decipher-samsung', { opacity: 1 }, P(0.36));
  runDecipher(tl, samsungChars, "SAMSUNG", 0.36);
  tl.to('#dlp-scene-decipher-samsung .dlp-decipher-sub', { opacity: 1, y: 0, duration: P(0.02) }, P(0.39));
  tl.to('#dlp-scene-decipher-samsung', { opacity: 0, duration: P(0.02) }, P(0.43));

  /* ==========================================
     VIGNETTE 2: ROCKSTAR
     ========================================== */
  // 2A. THE STORY: Terminal & Waterfall (0.46 - 0.56)
  tl.set('#dlp-scene-rockstar', { opacity: 1 }, P(0.46));
  tl.fromTo('#dlp-terminal', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: P(0.02) }, P(0.47));

  const termBody = document.getElementById('dlp-term-body');
  termBody.innerHTML = `<div class="term-line" id="tl1">> user: teapotuberhacker</div><div class="term-line" id="tl2">> broadcast: "I have everything. GTA 6. 90 videos. DM me."</div><div class="term-cursor"></div>`;

  tl.to('#tl1', { opacity: 1, duration: P(0.001) }, P(0.48));
  tl.to('#tl2', { opacity: 1, duration: P(0.001) }, P(0.49));

  const grid = document.getElementById('dlp-waterfall-grid');
  const files = [];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    el.className = 'dlp-waterfall-item';
    grid.appendChild(el);
    files.push(el);
  }

  files.forEach((f, i) => {
    const delay = P(0.50) + (Math.random() * P(0.02));
    tl.to(f, { y: 0, opacity: 1, duration: P(0.01), ease: "bounce.out" }, delay);
  });
  
  tl.to(files, { background: 'rgba(184, 92, 56, 0.35)', borderColor: 'var(--rust)', duration: P(0.005) }, P(0.53));
  tl.fromTo('#dlp-waterfall-overlay', { opacity: 0, y: 10, letterSpacing: '0.1em' }, { opacity: 1, y: 0, letterSpacing: '0.25em', duration: P(0.02) }, P(0.54));

  tl.to('#dlp-scene-rockstar', { opacity: 0, duration: P(0.02) }, P(0.58));

  // 2B. THE PUNCHLINE: Decipher (0.60 - 0.65)
  tl.set('#dlp-scene-decipher-rockstar', { opacity: 1 }, P(0.60));
  runDecipher(tl, rockstarChars, "ROCKSTAR GAMES", 0.60);
  tl.to('#dlp-scene-decipher-rockstar .dlp-decipher-sub', { opacity: 1, y: 0, duration: P(0.02) }, P(0.63));
  tl.to('#dlp-scene-decipher-rockstar', { opacity: 0, duration: P(0.02) }, P(0.66));

  /* ==========================================
     VIGNETTE 3: AT&T
     ========================================== */
  // 3A. THE STORY: Flatline (0.68 - 0.76)
  tl.set('#dlp-scene-att', { opacity: 1 }, P(0.68));
  
  tl.fromTo('#dlp-stmt-att1', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.015) }, P(0.68));
  tl.to('#dlp-stmt-att1', { opacity: 0, duration: P(0.01) }, P(0.70));
  
  tl.fromTo('#dlp-ekg-mask', { x: 0 }, { x: 800, duration: P(0.06), ease: "none" }, P(0.69));

  tl.fromTo('#dlp-stmt-att2', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.015) }, P(0.71));
  tl.to('#dlp-stmt-att2', { opacity: 0, duration: P(0.01) }, P(0.73));

  tl.fromTo('#dlp-stmt-att3', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.25em', duration: P(0.02) }, P(0.74));

  tl.to('#dlp-scene-att', { opacity: 0, duration: P(0.02) }, P(0.77));

  // 3B. THE PUNCHLINE: Decipher (0.78 - 0.83)
  tl.set('#dlp-scene-decipher-att', { opacity: 1 }, P(0.78));
  runDecipher(tl, attChars, "AT&T", 0.78);
  tl.to('#dlp-scene-decipher-att .dlp-decipher-sub', { opacity: 1, y: 0, duration: P(0.02) }, P(0.81));
  tl.to('#dlp-scene-decipher-att', { opacity: 0, duration: P(0.02) }, P(0.84));

  /* ==========================================
     VIGNETTE 4: CHANGE HEALTHCARE
     ========================================== */
  // 4A. THE STORY: Ransomware Folders (0.86 - 0.93)
  tl.set('#dlp-scene-change', { opacity: 1 }, P(0.86));
  
  const fGrid = document.getElementById('dlp-folder-grid');
  const folders = [];
  for(let i=0; i<45; i++) {
    const f = document.createElement('div');
    f.className = 'dlp-folder-icon';
    fGrid.appendChild(f);
    folders.push(f);
  }
  
  tl.to(fGrid, { opacity: 1, duration: P(0.01) }, P(0.86));
  
  tl.fromTo('#dlp-stmt-ch1', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.01) }, P(0.865));
  tl.to('#dlp-stmt-ch1', { opacity: 0, duration: P(0.005) }, P(0.88));
  
  tl.to('#dlp-padlock-container', { opacity: 1, scale: 1, duration: P(0.02), ease: "bounce.out" }, P(0.88));
  
  tl.fromTo('#dlp-stmt-ch2', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: P(0.01) }, P(0.885));
  tl.to('#dlp-stmt-ch2', { opacity: 0, duration: P(0.005) }, P(0.90));
  
  tl.to('#dlp-lock-shackle', { y: 3, duration: P(0.005) }, P(0.90));
  tl.to('#dlp-padlock-container rect', { fill: 'var(--rust)', duration: P(0.005) }, P(0.905));
  tl.to('#dlp-padlock-container circle', { fill: '#0c0b09', duration: P(0.005) }, P(0.905));
  tl.to(folders, { className: 'dlp-folder-icon locked', duration: P(0.01), stagger: 0.0005 }, P(0.905));
  
  tl.fromTo('#dlp-stmt-ch3', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.25em', duration: P(0.01) }, P(0.91));

  tl.to('#dlp-scene-change', { opacity: 0, duration: P(0.02) }, P(0.93));

  // 4B. THE PUNCHLINE: Decipher (0.94 - 0.97)
  tl.set('#dlp-scene-decipher-change', { opacity: 1 }, P(0.94));
  runDecipher(tl, changeChars, "CHANGE HEALTHCARE", 0.94);
  tl.to('#dlp-scene-decipher-change .dlp-decipher-sub', { opacity: 1, y: 0, duration: P(0.01) }, P(0.955));
  tl.to('#dlp-scene-decipher-change', { opacity: 0, duration: P(0.01) }, P(0.975));

  /* ==========================================
     THE CLIMAX (timeline positions 91-100, raw values)
     ========================================== */
  tl.set('#dlp-scene-list', { opacity: 1 }, 91);
  
  // Phase 1: List of 4 companies fades in
  tl.to('#dlp-final-list', { opacity: 1, duration: 1.5 }, 91);
  
  // Phase 2: "These are the ones that made the news."
  tl.fromTo('#dlp-stmt-climax1', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: 1.5 }, 92.5);

  // Phase 3: Items 01, 02, 03 fade out (staggered). Item 04 stays.
  tl.to('#dlp-li-1', { opacity: 0, x: -20, duration: 0.3 }, 94.2);
  tl.to('#dlp-li-2', { opacity: 0, x: -20, duration: 0.3 }, 94.35);
  tl.to('#dlp-li-3', { opacity: 0, x: -20, duration: 0.3 }, 94.5);
  
  // "Change Healthcare" text fades, leaving only "04"
  tl.to('#dlp-li-4-name', { opacity: 0, duration: 0.3 }, 94.6);
  // Remove border from item 04
  tl.set('#dlp-li-4', { borderBottom: 'none' }, 94.6);
  
  // Phase 4: Crossfade morph — "04" fades out while big "4" fades in at center
  tl.to('#dlp-li-4', { opacity: 0, duration: 0.4 }, 95);
  tl.to('#dlp-number-container', { opacity: 1, duration: 0.6 }, 95.1);
  
  // Statement stays visible during morph
  // --- Dead zone: "4" holds with statement from 95.7 to 96.2 ---
  
  // Phase 5: Statement fades, counter begins
  tl.to('#dlp-stmt-climax1', { opacity: 0, duration: 0.3 }, 96);

  const bigNumEl = document.getElementById('dlp-big-number');
  const bigSuffix = document.getElementById('dlp-big-suffix');
  const numObj = { val: 4 };

  // Phase 6: 4 → 400 (accelerate and STOP)
  tl.to(numObj, {
    val: 400,
    duration: 1.0,
    ease: 'power2.in',
    onUpdate: function () {
      bigNumEl.textContent = Math.floor(numObj.val).toLocaleString();
    }
  }, 96.2);

  // --- Dead zone: 400 holds from 97.2 to 97.8 ---

  // Phase 7: "Just last year." drifts in during the 400 plateau
  tl.fromTo('#dlp-stmt-400', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: 0.5 }, 97.3);
  tl.to('#dlp-stmt-400', { opacity: 0, duration: 0.3 }, 97.9);

  // Phase 8: 400 → 4,000 (accelerate and STOP)
  tl.to(numObj, {
    val: 4000,
    duration: 0.7,
    ease: 'power2.in',
    onUpdate: function () {
      bigNumEl.textContent = Math.floor(numObj.val).toLocaleString();
    }
  }, 98.1);

  // --- Dead zone: 4,000 holds from 98.8 to 99.0 ---

  // Phase 9: White "s" fades in → 4,000s
  tl.to(bigSuffix, { opacity: 1, duration: 0.3 }, 99.0);

  // Phase 10: "Most of them don't know yet."
  tl.fromTo('#dlp-stmt-final', { opacity: 0, y: 10, letterSpacing: '0.15em' }, { opacity: 1, y: 0, letterSpacing: '0.2em', duration: 0.8 }, 99.3);

  /* ==========================================
     VALIDATION STACKING CARDS (Post-Scroll Story)
     ========================================== */
  const valContainer = document.getElementById('validation-stack-container');
  if (valContainer) {
    const valTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#validation-stack-container',
        start: 'top top+=10%',
        end: 'bottom bottom',
        scrub: true
      }
    });

    // Card 2 slides up but stops 16px below the top to expose Card 1's colored border
    valTl.to('#val-card-2', { y: 16, ease: 'none', duration: 1 }, 0);
    // Card 1 scales down and fades slightly to give depth
    valTl.to('#val-card-1', { scale: 0.96, opacity: 0.5, ease: 'none', duration: 1 }, 0);

    // Card 3 slides up but stops 32px below the top to expose Card 1 & 2's colored borders
    valTl.to('#val-card-3', { y: 32, ease: 'none', duration: 1 }, 1);
    // Card 2 scales down
    valTl.to('#val-card-2', { scale: 0.96, opacity: 0.5, ease: 'none', duration: 1 }, 1);
    // Card 1 scales down further
    valTl.to('#val-card-1', { scale: 0.92, opacity: 0.25, ease: 'none', duration: 1 }, 1);
  }

});



