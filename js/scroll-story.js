// ═══════════════════════════════════════════════════════
// SCROLL STORY - GSAP Animation Controller
// ═══════════════════════════════════════════════════════

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════

const CAPTIONS = [
  '',
  'John opens the first of the 47 alerts to triage it.',
  '6 findings inside. Has to go through each of them until he finds the real threat.',
  'He opens the first finding. Raw data floods the screen. No contexts. He opens the source reports to find some.',
  'Three reports opens across three new tabs.',
  'Still no clarity. He exports everything to Excel.',
  'Now the real investigation begins. In Excel. He connects the signals himself and reaches a verdict.',
  '22 minutes later: False positive. Five more findings remain.',
  '',
  '',
];

const CLOCKS = [
  { time: '9:00', period: 'AM', elapsed: '' },
  { time: '9:00', period: 'AM', elapsed: '' },
  { time: '9:01', period: 'AM', elapsed: '1 min' },
  { time: '9:02', period: 'AM', elapsed: '2 min' },
  { time: '9:04', period: 'AM', elapsed: '4 min' },
  { time: '9:06', period: 'AM', elapsed: '6 min' },
  { time: '9:11', period: 'AM', elapsed: '11 min' },
  { time: '9:22', period: 'AM', elapsed: '22 min' },
  { time: '5:30', period: 'PM', elapsed: '8h 30m' },
  { time: '9:00', period: 'AM', elapsed: 'next day' },
];

let currentStep = 0;
const animatedSteps = new Set(); // Track which steps have been animated

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════
// ANALYST DAY TEXT HIGHLIGHT
// ═══════════════════════════════════════════════════════

function setupAnalystDayHighlight() {
  const analystDay = document.getElementById('analyst-day');
  
  if (analystDay) {
    gsap.to(analystDay, {
      color: 'var(--rust)',
      fontWeight: 700,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: analystDay,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 1.5
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => {
  initializeContent();
  updateStep(0);
  setupScrollTriggers();
  setupInitialAnimations();
  setupAnalystDayHighlight();
});

// ═══════════════════════════════════════════════════════
// CONTENT INITIALIZATION
// ═══════════════════════════════════════════════════════

function initializeContent() {
  // Create dot grid for hero (47 dots)
  createDotGrid('dot-grid', 47);
  
  // Create alerts list
  createAlertsList();
  
  // Create findings page
  createFindingsPage();
  
  // Create finding panel
  createFindingPanel();
  
  // Create three tabs
  createThreeTabs();
  
  // Create Excel content
  createExcelContent();
  
  // Create verdict screen
  createVerdictScreen();
  
  // Create math dot grid (47 dots, 1 filled)
  createMathDotGrid();
  
  // Create final background dots
  createFinalBgDots();
}

// ═══════════════════════════════════════════════════════
// DOT GRID CREATION
// ═══════════════════════════════════════════════════════

function createDotGrid(containerId, count) {
  const container = document.getElementById(containerId);
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('rust');
    container.appendChild(dot);
  }
}

function createMathDotGrid() {
  const container = document.getElementById('math-dot-grid');
  for (let i = 0; i < 47; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('filled');
    container.appendChild(dot);
  }
}

function createFinalBgDots() {
  const container = document.getElementById('final-bg-dots');
  for (let i = 0; i < 70; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    container.appendChild(dot);
  }
}

// ═══════════════════════════════════════════════════════
// ALERTS LIST
// ═══════════════════════════════════════════════════════

function createAlertsList() {
  const container = document.getElementById('alerts-list');
  
  const header = document.createElement('div');
  header.className = 'alerts-header';
  header.innerHTML = `
    <span style="width: 65px">SEVERITY</span>
    <span style="width: 85px">ID</span>
    <span style="flex: 1">DESCRIPTION</span>
    <span style="width: 45px">STATUS</span>
  `;
  container.appendChild(header);
  
  const rows = [
    { severity: 'CRITICAL', color: '#D44030', id: 'RE-2024000', width: 45 },
    { severity: 'CRITICAL', color: '#D44030', id: 'RE-2024001', width: 62 },
    { severity: 'HIGH', color: '#C45A2D', id: 'RE-2024002', width: 79 },
    { severity: 'HIGH', color: '#C45A2D', id: 'RE-2024003', width: 56 },
    { severity: 'MEDIUM', color: '#5A4E46', id: 'RE-2024004', width: 73 },
    { severity: 'MEDIUM', color: '#5A4E46', id: 'RE-2024005', width: 50 },
    { severity: 'MEDIUM', color: '#5A4E46', id: 'RE-2024006', width: 67 },
    { severity: 'MEDIUM', color: '#5A4E46', id: 'RE-2024007', width: 84 },
    { severity: 'MEDIUM', color: '#5A4E46', id: 'RE-2024008', width: 61 },
  ];
  
  rows.forEach((row, i) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'alert-row' + (i === 0 ? ' first' : '');
    rowEl.innerHTML = `
      <span class="alert-severity" style="color: ${row.color}">● ${row.severity}</span>
      <span class="alert-id">${row.id}</span>
      <span class="alert-desc">
        <div class="alert-bar" style="width: ${row.width}%"></div>
      </span>
      <span class="alert-status">OPEN</span>
    `;
    container.appendChild(rowEl);
  });
  
  const footer = document.createElement('div');
  footer.className = 'alerts-footer';
  footer.textContent = 'Showing 9 of 47';
  container.appendChild(footer);
}

// ═══════════════════════════════════════════════════════
// FINDINGS PAGE
// ═══════════════════════════════════════════════════════

function createFindingsPage() {
  const container = document.getElementById('findings-page');
  
  container.innerHTML = `
    <div class="findings-header">
      RE-2024000 — <span style="color: #D44030">CRITICAL</span>
    </div>
    <div class="findings-count">6 FINDINGS</div>
  `;
  
  const dataWidths = [
    [45, 30, 55],
    [38, 42, 48],
    [52, 35, 60],
    [40, 50, 45],
    [48, 38, 52],
    [42, 45, 50],
  ];
  
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'finding-row' + (i === 0 ? ' first' : '');
    
    const dataBars = dataWidths[i].map(w => 
      `<div class="finding-bar" style="width: ${w}px"></div>`
    ).join('');
    
    row.innerHTML = `
      <div class="finding-dot"></div>
      <span class="finding-id">FND-${i + 1}</span>
      <div class="finding-data">${dataBars}</div>
      <span class="finding-status">${i === 0 ? 'REVIEWING' : 'PENDING'}</span>
    `;
    container.appendChild(row);
  }
}

// ═══════════════════════════════════════════════════════
// FINDING PANEL
// ═══════════════════════════════════════════════════════

function createFindingPanel() {
  const container = document.getElementById('finding-panel');
  
  // Left side (dimmed findings list)
  const left = document.createElement('div');
  left.className = 'panel-left';
  left.innerHTML = `
    <div style="color: var(--text-dim); margin-bottom: 4px; font-size: 9px">
      RE-2024000 — <span style="color: #D44030">CRITICAL</span>
    </div>
    <div style="color: var(--text-dim); margin-bottom: 8px; font-size: 8px; letter-spacing: 0.1em">6 FINDINGS</div>
  `;
  
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.style.cssText = `
      padding: 5px 6px; margin-bottom: 3px; border-radius: 3px;
      border: 1px solid ${i === 0 ? 'rgba(196, 90, 45, 0.25)' : 'var(--border)'};
      background: ${i === 0 ? 'rgba(196, 90, 45, 0.03)' : 'transparent'};
      display: flex; align-items: center; gap: 6px;
    `;
    row.innerHTML = `
      <div style="width: 4px; height: 4px; border-radius: 2px; background: ${i === 0 ? 'var(--rust)' : 'var(--border)'}"></div>
      <span style="font-size: 7px; color: var(--text-dim)">FND-${i + 1}</span>
      <div style="flex: 1">
        <div style="height: 3px; border-radius: 2px; background: var(--border); width: ${30 + i * 8}%"></div>
      </div>
    `;
    left.appendChild(row);
  }
  container.appendChild(left);
  
  // Right side (panel)
  const right = document.createElement('div');
  right.className = 'panel-right';
  right.innerHTML = `
    <div class="panel-title">FINDING 1 — DETAILS</div>
    <div class="panel-subtitle">FND-1 · Classification anomaly detected</div>
    <div class="source-links">
      <div class="source-label">SOURCE REPORTS</div>
      <div class="source-link">
        <span class="source-icon">↗</span>
        <span class="source-name">Classification Report</span>
        <span class="source-url">/reports/classification</span>
      </div>
      <div class="source-link">
        <span class="source-icon">↗</span>
        <span class="source-name">Vulnerability Report</span>
        <span class="source-url">/reports/vulnerability</span>
      </div>
      <div class="source-link">
        <span class="source-icon">↗</span>
        <span class="source-name">Violation Report</span>
        <span class="source-url">/reports/violation</span>
      </div>
    </div>
    <div class="source-label">RAW DATA</div>
    <div class="data-rows"></div>
  `;
  
  const dataRows = right.querySelector('.data-rows');
  const widths = [65, 45, 72, 38, 58, 70, 42, 68, 50, 75, 40, 62, 55, 48];
  widths.forEach((w, i) => {
    const row = document.createElement('div');
    row.className = 'data-row';
    row.innerHTML = `
      <span class="data-row-num">${i + 1}</span>
      <div class="data-bar" style="width: ${w}%; flex: 1; max-width: ${w}%"></div>
      <div class="data-bar" style="width: ${w * 0.6}%; max-width: ${w * 0.6}%"></div>
    `;
    dataRows.appendChild(row);
  });
  
  container.appendChild(right);
}

// ═══════════════════════════════════════════════════════
// THREE TABS
// ═══════════════════════════════════════════════════════

function createThreeTabs() {
  const container = document.getElementById('three-tabs');
  
  const tabs = [
    { name: 'Classification Report', url: 'reports/classification', file: 'classification_report.xlsx', size: '2.4 MB' },
    { name: 'Vulnerability Report', url: 'reports/vulnerability', file: 'vulnerability_report.xlsx', size: '1.8 MB' },
    { name: 'Violation Report', url: 'reports/violation', file: 'violation_report.xlsx', size: '3.1 MB' },
  ];
  
  tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab-window';
    
    const widths = Array.from({ length: 8 }, () => 25 + Math.floor(Math.random() * 55));
    const rows = widths.map((w, i) => `
      <div class="report-row">
        <div class="report-label">ROW ${i + 1}</div>
        <div class="report-bar" style="width: ${w}%"></div>
      </div>
    `).join('');
    
    tabEl.innerHTML = `
      <div class="tab-chrome">
        <div class="browser-dots">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
        </div>
        <div class="tab-url">${tab.url}</div>
      </div>
      <div class="tab-content">
        <div class="tab-title">${tab.name}</div>
        <div class="report-rows">${rows}</div>
      </div>
      <div class="download-bar">
        <div class="download-info">
          <div class="download-left">
            <span class="download-icon">↓</span>
            <span class="download-name">${tab.file}</span>
          </div>
          <span class="download-size">${tab.size}</span>
        </div>
        <div class="download-progress">
          <div class="download-progress-bar"></div>
        </div>
      </div>
    `;
    container.appendChild(tabEl);
  });
}

// ═══════════════════════════════════════════════════════
// EXCEL CONTENT
// ═══════════════════════════════════════════════════════

function createExcelContent() {
  const grid = document.getElementById('excel-grid');
  
  // Header
  const header = document.createElement('div');
  header.className = 'excel-header';
  ['', 'A', 'B', 'C', 'D', 'E'].forEach(col => {
    const cell = document.createElement('div');
    cell.className = 'excel-cell ' + (col === '' ? 'row-num' : 'col');
    cell.textContent = col;
    header.appendChild(cell);
  });
  grid.appendChild(header);
  
  // Rows
  const rowWidths = [
    [45, 38, 52, 40, 48],
    [50, 42, 48, 45, 52],
    [42, 55, 45, 60, 48],
    [48, 40, 52, 42, 50],
    [45, 58, 48, 55, 45],
    [52, 45, 50, 48, 52],
    [48, 50, 45, 52, 48],
  ];
  
  rowWidths.forEach((widths, i) => {
    const row = document.createElement('div');
    row.className = 'excel-row';
    
    const rowNum = document.createElement('div');
    rowNum.className = 'excel-row-num';
    rowNum.textContent = i + 1;
    row.appendChild(rowNum);
    
    widths.forEach((w, j) => {
      const cell = document.createElement('div');
      const isMatch = (i === 2 && (j === 1 || j === 3)) || (i === 4 && (j === 1 || j === 3));
      cell.className = 'excel-data-cell' + (isMatch ? ' match' : '');
      cell.innerHTML = `<div class="excel-data-bar" style="width: ${w}%"></div>`;
      row.appendChild(cell);
    });
    
    grid.appendChild(row);
  });
  
  // Annotation
  const annotation = document.createElement('div');
  annotation.className = 'excel-annotation';
  annotation.innerHTML = `
    <div class="excel-match-box"></div>
    <span class="excel-match-label">CROSS-REFERENCE MATCH</span>
  `;
  grid.appendChild(annotation);
  
  // Chart
  const chart = document.getElementById('excel-chart');
  const barHeights = [65, 40, 85, 55, 72, 30, 90];
  const barsContainer = document.createElement('div');
  barsContainer.className = 'chart-bars';
  
  barHeights.forEach(h => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.background = h > 70 ? 'var(--green)' : h > 50 ? 'rgba(74, 139, 92, 0.38)' : 'rgba(74, 139, 92, 0.19)';
    bar.dataset.height = h;
    barsContainer.appendChild(bar);
  });
  
  chart.innerHTML = `
    <div class="chart-title">SEVERITY DIST.</div>
  `;
  chart.appendChild(barsContainer);
  
  const donut = document.createElement('div');
  donut.className = 'chart-donut';
  donut.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="12" fill="none" stroke="var(--border)" stroke-width="4" />
      <circle id="donut-circle" cx="16" cy="16" r="12" fill="none" stroke="var(--green)" stroke-width="4"
        stroke-dasharray="75.4" stroke-dashoffset="75.4" stroke-linecap="round" transform="rotate(-90 16 16)" />
    </svg>
    <div>
      <div class="donut-value">65%</div>
      <div class="donut-label">FALSE</div>
    </div>
  `;
  chart.appendChild(donut);
  
  // Tabs
  const tabs = document.getElementById('excel-tabs');
  const sheetTabs = ['classification_report', 'vulnerability_report', 'violation_report'];
  sheetTabs.forEach((name, i) => {
    const tab = document.createElement('div');
    tab.className = 'excel-tab' + (i === 0 ? ' active' : '');
    tab.textContent = name;
    tabs.appendChild(tab);
  });
}

// ═══════════════════════════════════════════════════════
// VERDICT SCREEN
// ═══════════════════════════════════════════════════════

function createVerdictScreen() {
  const container = document.getElementById('verdict-screen');
  container.innerHTML = `
    <div class="verdict-header">
      RE-2024000 — <span style="color: #D44030">CRITICAL</span>
    </div>
    <div class="verdict-subtitle">FINDING 1 OF 6 — TRIAGE VERDICT</div>
    <div class="verdict-content">
      <div>
        <div class="verdict-buttons">
          <div class="verdict-btn">TRUE</div>
          <div class="verdict-btn selected">FALSE</div>
        </div>
        <div class="verdict-message">Finding 1 of 6 — Verdict submitted</div>
        <div class="verdict-time">22 minutes elapsed</div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// INITIAL ANIMATIONS (Step 0)
// ═══════════════════════════════════════════════════════

function setupInitialAnimations() {
  const tl = gsap.timeline();
  
  // Hero time
  tl.from('.hero-time', { opacity: 0, y: 12, duration: 0.8, delay: 0.2, ease: 'power2.out' });
  
  // Hero subtitle
  tl.from('.hero-subtitle', { opacity: 0, y: 8, duration: 0.6, ease: 'power2.out' }, '-=0.2');
  
  // Dot grid
  tl.from('#dot-grid', { opacity: 0, duration: 0.8 }, '-=0.2');
  
  // Animate dots
  const dots = document.querySelectorAll('#dot-grid .dot');
  dots.forEach((dot, i) => {
    tl.to(dot, {
      scale: 1,
      opacity: i === 0 ? 1 : 0.4,
      duration: i === 0 ? 0.4 : 0.15,
      ease: 'back.out(1.7)'
    }, `-=${0.8 - i * 0.005}`);
  });
  
  // Hero count
  tl.from('.hero-count', { opacity: 0, y: 6, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  
  // Scroll hint
  tl.to('#scroll-hint', { opacity: 1, duration: 0.8 }, '+=0.5');
  tl.to('#scroll-hint .scroll-arrow', {
    y: 5,
    duration: 1.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  }, '-=0.8');
}

// ═══════════════════════════════════════════════════════
// SCROLL TRIGGERS
// ═══════════════════════════════════════════════════════

function setupScrollTriggers() {
  const container = document.getElementById('scroll-container');
  
  // Main scroll trigger for step tracking
  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => {
      const progress = self.progress;
      // Align step numbers with scroll trigger percentages
      // 0-10% = step 1, 10-20% = step 2, 20-30% = step 3, etc.
      let step;
      if (progress < 0.01) {
        step = 0;
      } else if (progress < 0.10) {
        step = 1;
      } else if (progress < 0.20) {
        step = 2;
      } else if (progress < 0.30) {
        step = 3;
      } else if (progress < 0.40) {
        step = 4;
      } else if (progress < 0.50) {
        step = 5;
      } else if (progress < 0.60) {
        step = 6;
      } else if (progress < 0.70) {
        step = 7;
      } else if (progress < 0.80) {
        step = 8;
      } else {
        step = 9;
      }
      
      updateStep(step);
    }
  });
  
  // Step 1 animation (hero fade) is handled by setupStep1Animation
  setupStep1Animation();
}

// ═══════════════════════════════════════════════════════
// STEP ANIMATIONS
// ═══════════════════════════════════════════════════════

function setupStep1Animation() {
  const container = document.getElementById('scroll-container');
  
  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: '10% top',
    scrub: 0.5,
    onUpdate: (self) => {
      const progress = self.progress;
      
      // Hide scroll hint immediately
      if (progress > 0.05) {
        gsap.to('#scroll-hint', { opacity: 0, duration: 0.3 });
      }
      
      // Fade out hero content
      const heroOpacity = progress > 0.5 ? 0 : 1 - (progress * 2);
      const heroScale = 1 - (progress * 0.04);
      const heroBlur = progress > 0.3 ? (progress - 0.3) * 8.57 : 0; // 0.3 to 1.0 = 0 to 6px
      
      gsap.to('.hero-content', {
        opacity: Math.max(0, heroOpacity),
        scale: heroScale,
        filter: `blur(${heroBlur}px)`,
        duration: 0.1
      });
      
      // Fade in browser
      const browserOpacity = progress > 0.45 ? Math.min(1, (progress - 0.45) / 0.25) : 0;
      const browserY = progress > 0.45 ? Math.max(0, 20 - ((progress - 0.45) / 0.35) * 20) : 20;
      
      gsap.to('#step-0-1 .browser-window', {
        opacity: browserOpacity,
        y: browserY,
        duration: 0.1
      });
      
      // Animate alerts list when browser is visible
      if (progress > 0.7) {
        const alerts = document.querySelectorAll('.alert-row');
        alerts.forEach((alert, i) => {
          gsap.to(alert, {
            opacity: 1,
            x: 0,
            duration: 0.12,
            delay: i * 0.02
          });
        });
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
// STEP UPDATE
// ═══════════════════════════════════════════════════════

function updateStep(step) {
  if (step === currentStep) return;
  
  currentStep = step;
  
  // Update time display
  const timeDisplay = document.getElementById('time-display');
  const captionDisplay = document.getElementById('caption-display');
  
  if ((step >= 1 && step <= 7)) {
    timeDisplay.classList.remove('hidden');
    timeDisplay.classList.add('visible');
    captionDisplay.classList.remove('hidden');
    captionDisplay.classList.add('visible');
    
    const clock = CLOCKS[step];
    document.getElementById('time-value').textContent = clock.time;
    document.getElementById('time-period').textContent = clock.period;
    document.getElementById('time-elapsed').textContent = clock.elapsed ? `+${clock.elapsed}` : '';
    
    // Update caption
    document.getElementById('step-number').textContent = step;
    document.getElementById('caption-text').textContent = CAPTIONS[step];
    
    // Update progress circle
    const progress = step / 7;
    const offset = 78.5 - (78.5 * progress);
    gsap.to('#progress-circle', {
      strokeDashoffset: offset,
      duration: 0.5,
      ease: 'power2.out'
    });
  } else {
    timeDisplay.classList.remove('visible');
    captionDisplay.classList.remove('visible');
  }
  
  // Show the appropriate step content
  showStep(step);
}

function showStep(step) {
  // Hide all steps
  const allSteps = document.querySelectorAll('.step-content');
  allSteps.forEach(el => {
    el.classList.remove('active');
  });
  
  // Show current step
  const stepMap = {
    0: 'step-0-1',
    1: 'step-0-1',
    2: 'step-2',
    3: 'step-3',
    4: 'step-4-5',
    5: 'step-4-5',
    6: 'step-6',
    7: 'step-7',
    8: 'step-8',
    9: 'step-9'
  };
  
  const stepId = stepMap[step];
  
  if (stepId) {
    const element = document.getElementById(stepId);
    if (element) {
      element.classList.add('active');
      
      // Trigger animations only once per step
      if (!animatedSteps.has(step)) {
        animatedSteps.add(step);
        
        if (step === 2) {
          animateFindingsPage();
        } else if (step === 3) {
          animateFindingPanel();
        } else if (step === 4) {
          animateThreeTabs();
        } else if (step === 5) {
          animateDownloads();
        } else if (step === 6) {
          animateExcel();
        } else if (step === 7) {
          animateVerdict();
        } else if (step === 8) {
          animateMath();
        } else if (step === 9) {
          animateFinal();
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════
// CONTENT ANIMATIONS
// ═══════════════════════════════════════════════════════

function animateFindingsPage() {
  const rows = document.querySelectorAll('#findings-page .finding-row');
  rows.forEach((row, i) => {
    gsap.fromTo(row,
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: 0.4, delay: i * 0.05, ease: 'power2.out' }
    );
  });
}

function animateFindingPanel() {
  gsap.fromTo('.panel-right',
    { opacity: 0, x: 40 },
    { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
  );
  
  animateFindingPanelDetails();
}

function animateFindingPanelDetails() {
  const links = document.querySelectorAll('.source-link');
  links.forEach((link, i) => {
    gsap.fromTo(link,
      { opacity: 0, x: 8 },
      { opacity: 1, x: 0, duration: 0.3, delay: 0.1 + i * 0.08, ease: 'power2.out' }
    );
  });
  
  const dataRows = document.querySelectorAll('.data-row');
  dataRows.forEach((row, i) => {
    gsap.fromTo(row,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, delay: 0.2 + i * 0.015, ease: 'power2.out' }
    );
  });
}

function animateThreeTabs() {
  const tabs = document.querySelectorAll('.tab-window');
  tabs.forEach((tab, i) => {
    gsap.fromTo(tab,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: i * 0.15, ease: 'power2.out' }
    );
  });
}

function animateDownloads() {
  const downloads = document.querySelectorAll('.download-bar');
  downloads.forEach((download, i) => {
    gsap.to(download, {
      opacity: 1,
      height: 'auto',
      duration: 0.3,
      delay: i * 0.15,
      ease: 'power2.out'
    });
    
    const progressBar = download.querySelector('.download-progress-bar');
    gsap.fromTo(progressBar,
      { width: '0%' },
      { width: '100%', duration: 0.6, delay: i * 0.15 + 0.1, ease: 'power2.out' }
    );
  });
}

function animateExcel() {
  // Create a faster timeline - all animations complete within 0.4s
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  
  // Animate everything almost simultaneously for faster load
  const rows = document.querySelectorAll('.excel-row');
  tl.fromTo(rows,
    { opacity: 0, x: -5 },
    { opacity: 1, x: 0, duration: 0.2, stagger: 0.01 },
    0
  );
  
  const tabs = document.querySelectorAll('.excel-tab');
  tl.fromTo(tabs,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.2, stagger: 0.03 },
    0
  );
  
  tl.to('.excel-chart',
    { opacity: 1, x: 0, duration: 0.2 },
    0.05
  );
  
  const bars = document.querySelectorAll('.chart-bar');
  bars.forEach((bar) => {
    const height = bar.dataset.height;
    tl.fromTo(bar,
      { height: '0%' },
      { height: `${height}%`, duration: 0.3 },
      0.1
    );
  });
  
  tl.to('.chart-donut',
    { opacity: 1, scale: 1, duration: 0.2 },
    0.15
  );
  
  tl.fromTo('#donut-circle',
    { strokeDashoffset: 75.4 },
    { strokeDashoffset: 75.4 * 0.35, duration: 0.3 },
    0.2
  );
  
  tl.to('.excel-annotation',
    { opacity: 1, duration: 0.2 },
    0.1
  );
}

function animateVerdict() {
  gsap.to('.verdict-content', {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    delay: 0.1,
    ease: 'power2.out'
  });
  
  gsap.to('.verdict-btn.selected', {
    scale: [0.95, 1.03, 1],
    duration: 0.3,
    delay: 0.3,
    ease: 'power2.out'
  });
  
  gsap.to('.verdict-message', {
    opacity: 1,
    duration: 0.3,
    delay: 0.5,
    ease: 'power2.out'
  });
  
  gsap.to('.verdict-time', {
    opacity: 1,
    duration: 0.3,
    delay: 0.7,
    ease: 'power2.out'
  });
}

function animateMath() {
  const dots = document.querySelectorAll('#math-dot-grid .dot');
  dots.forEach((dot, i) => {
    gsap.fromTo(dot,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: i === 0 ? 1 : 0.25, duration: 0.12, delay: i * 0.003, ease: 'power2.out' }
    );
  });
  
  const lines = document.querySelectorAll('.math-line');
  lines.forEach((line, i) => {
    gsap.fromTo(line,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.1 + i * 0.2, ease: 'power2.out' }
    );
  });
  
  gsap.to('.math-divider', {
    opacity: 1,
    duration: 0.3,
    delay: 0.3,
    ease: 'power2.out'
  });
  
  gsap.fromTo('.math-alert',
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.4, delay: 0.6, ease: 'power2.out' }
  );
}

function animateFinal() {
  // Animate background dots
  const bgDots = document.querySelectorAll('#final-bg-dots .dot');
  bgDots.forEach((dot, i) => {
    gsap.to(dot, {
      opacity: [0.3, 0.8, 0.3],
      duration: 3,
      repeat: -1,
      delay: i * 0.03,
      ease: 'sine.inOut'
    });
  });
  
  gsap.to('.final-label', {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out'
  });
  
  gsap.fromTo('.final-count',
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' }
  );
  
  gsap.to('.final-message', {
    opacity: 1,
    duration: 0.5,
    delay: 0.5,
    ease: 'power2.out'
  });
}

