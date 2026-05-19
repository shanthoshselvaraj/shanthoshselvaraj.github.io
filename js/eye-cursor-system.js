/**
 * Unified Eye Cursor System
 * Manages the complete flow:
 * 1. Hero eye (looking animation) in hero section on page load
 * 2. First mouse movement hides hero, shows blinking cursor
 * 3. Mouse activity (move/scroll) keeps blinking cursor active
 * 4. 3 seconds of inactivity switches to looking cursor
 * 5. Any activity switches back to blinking cursor
 */

(() => {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    const CONFIG = {
        heroEyeSize: 200,           // Hero eye size in pixels
        cursorSize: 50,             // Cursor size in pixels (increased from 40)
        inactivityTimeout: 3000,    // 3 seconds of inactivity to switch to looking
        frameInterval: 30,          // Frame interval in ms (~33fps)
        scrollThreshold: 300        // Scroll distance for hero transition (deprecated)
    };

    // ============================================================================
    // STATE
    // ============================================================================
    const state = {
        phase: 'hero',              // 'hero', 'blinking', 'looking', 'hero-return', 'scroll-pill', 'dragger'
        heroEyeActive: true,
        cursorActive: false,
        mouseX: -200,
        mouseY: -200,
        isVisible: false,
        currentFrame: 0,
        inactivityTimer: null,
        hasFirstMouseMove: false,
        isInHeroSection: false,
        lookingCycleComplete: false,
        isInScrollStory: false,
        hasScrolledInStory: false,
        isOverSlider: false,
        isForcedLooking: false
    };

    // ============================================================================
    // DOM ELEMENTS
    // ============================================================================
    let heroEyeContainer = null;
    let heroEyeSvg = null;
    let heroEyeball = null;
    let heroEyelid = null;
    let cursorContainer = null;
    let cursorSvg = null;
    let cursorEyeball = null;
    let cursorEyelid = null;

    // ============================================================================
    // ANIMATION TIMERS
    // ============================================================================
    let heroAnimationId = null;
    let cursorAnimationId = null;
    let cursorRafId = null;

    // ============================================================================
    // FRAME DATA (imported from existing files)
    // ============================================================================
    
    // Looking animation frames (500 frames) - used for hero and looking cursor
    const LOOKING_RLE = [[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,31],[.499,.416,.295,.083,.29,.577,.31,.547,.707,.583,.053,1],[.499,.422,.295,.08,.283,.573,.297,.557,.713,.58,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.584,.572,.125,.107,.253,.447,.523,.28,.813,.477,.08,1],[.601,.572,.102,.123,.263,.433,.533,.263,.813,.48,.08,1],[.607,.571,.097,.128,.267,.427,.547,.257,.813,.483,.077,1],[.609,.571,.092,.132,.27,.433,.563,.253,.813,.483,.08,1],[.61,.571,.09,.132,.27,.43,.55,.253,.813,.483,.077,1],[.61,.571,.09,.132,.27,.43,.547,.253,.813,.483,.077,32],[.549,.573,.128,.137,.237,.443,.503,.253,.8,.463,.08,1],[.525,.573,.135,.137,.223,.44,.487,.253,.793,.453,.08,1],[.513,.573,.137,.137,.22,.447,.48,.253,.79,.447,.08,1],[.507,.573,.137,.137,.217,.443,.477,.253,.787,.45,.08,1],[.503,.573,.137,.137,.217,.45,.473,.253,.787,.443,.08,1],[.501,.573,.138,.137,.213,.437,.473,.253,.783,.453,.08,1],[.5,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,2],[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,32],[.499,.416,.295,.083,.29,.577,.31,.547,.707,.583,.053,1],[.499,.422,.295,.08,.283,.573,.297,.557,.713,.58,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.419,.572,.128,.107,.187,.483,.443,.283,.75,.443,.077,1],[.4,.572,.107,.123,.183,.473,.393,.267,.737,.437,.08,1],[.393,.571,.097,.128,.183,.477,.383,.26,.733,.423,.08,1],[.39,.571,.093,.132,.183,.477,.383,.257,.73,.43,.08,1],[.389,.571,.092,.132,.183,.477,.403,.253,.73,.423,.077,1],[.389,.571,.092,.132,.183,.477,.393,.253,.73,.42,.077,1],[.389,.571,.092,.132,.183,.477,.393,.253,.727,.433,.077,31],[.449,.573,.128,.137,.197,.457,.44,.253,.763,.437,.08,1],[.474,.573,.135,.137,.207,.457,.453,.253,.773,.447,.08,1],[.485,.573,.137,.137,.21,.453,.463,.253,.78,.44,.08,1],[.491,.573,.138,.137,.21,.443,.467,.253,.78,.45,.08,1],[.495,.573,.138,.137,.213,.45,.467,.253,.783,.443,.08,1],[.497,.573,.137,.137,.213,.447,.47,.253,.783,.447,.08,1],[.498,.573,.138,.137,.213,.447,.47,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.447,.47,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,32],[.499,.416,.295,.083,.29,.577,.31,.547,.707,.583,.053,1],[.499,.422,.295,.08,.283,.573,.297,.557,.713,.58,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.441,.488,.14,.102,.223,.43,.43,.27,.79,.513,.08,1],[.428,.479,.122,.105,.227,.413,.437,.25,.787,.52,.08,1],[.424,.476,.117,.105,.227,.407,.437,.243,.787,.517,.08,1],[.422,.475,.115,.105,.227,.4,.44,.24,.787,.517,.08,1],[.421,.475,.113,.105,.227,.4,.463,.237,.787,.517,.08,1],[.421,.475,.113,.105,.227,.4,.46,.237,.787,.517,.08,32],[.502,.417,.293,.087,.283,.563,.31,.533,.7,.567,.053,1],[.5,.422,.295,.08,.283,.577,.293,.557,.713,.577,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.499,.573,.157,.107,.21,.457,.493,.283,.787,.463,.08,1],[.499,.573,.145,.127,.213,.453,.463,.267,.787,.447,.077,1],[.499,.573,.14,.133,.213,.45,.46,.26,.783,.453,.077,1],[.499,.573,.138,.137,.213,.447,.46,.257,.783,.453,.077,1],[.499,.573,.137,.137,.213,.447,.48,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.443,.473,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,31],[.499,.416,.295,.083,.29,.577,.31,.547,.707,.583,.053,1],[.499,.422,.295,.08,.283,.573,.297,.557,.713,.58,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.554,.492,.142,.102,.22,.513,.507,.27,.787,.43,.077,1],[.569,.48,.125,.107,.223,.51,.507,.25,.787,.413,.08,1],[.573,.477,.117,.107,.227,.517,.507,.243,.787,.41,.08,1],[.576,.476,.115,.105,.227,.513,.51,.24,.787,.407,.077,1],[.577,.475,.113,.105,.227,.513,.503,.24,.787,.407,.08,1],[.577,.475,.113,.105,.227,.513,.537,.237,.787,.407,.08,32],[.533,.523,.133,.13,.22,.477,.49,.25,.787,.423,.08,1],[.516,.548,.137,.135,.217,.463,.47,.253,.783,.443,.077,1],[.508,.559,.138,.137,.217,.46,.47,.253,.783,.447,.077,1],[.504,.566,.137,.137,.213,.443,.47,.253,.783,.447,.077,1],[.502,.569,.138,.137,.213,.443,.47,.253,.783,.45,.08,1],[.5,.571,.137,.137,.213,.443,.47,.253,.783,.45,.08,1],[.5,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,33],[.499,.416,.295,.083,.29,.577,.31,.547,.707,.583,.053,1],[.499,.422,.295,.08,.283,.573,.297,.557,.713,.58,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.554,.619,.147,.102,.233,.467,.497,.337,.813,.53,.08,1],[.569,.626,.128,.117,.24,.46,.54,.33,.817,.537,.077,1],[.574,.628,.12,.118,.243,.46,.51,.33,.817,.543,.08,1],[.576,.629,.117,.122,.243,.453,.567,.327,.817,.547,.077,1],[.577,.629,.115,.122,.243,.45,.547,.327,.817,.547,.077,1],[.578,.629,.115,.122,.243,.45,.543,.327,.817,.547,.077,1],[.578,.629,.115,.122,.243,.447,.543,.327,.817,.547,.077,31],[.533,.601,.133,.133,.223,.443,.507,.283,.803,.487,.08,1],[.516,.587,.137,.137,.22,.453,.47,.27,.793,.47,.077,1],[.508,.581,.138,.137,.217,.447,.463,.263,.79,.457,.077,1],[.504,.578,.137,.137,.217,.45,.497,.257,.787,.457,.08,1],[.502,.576,.138,.137,.213,.44,.463,.257,.787,.447,.077,1],[.5,.574,.137,.137,.213,.443,.497,.253,.787,.44,.08,1],[.5,.574,.137,.137,.213,.443,.477,.253,.783,.453,.08,1],[.499,.574,.137,.137,.213,.443,.473,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,32],[.499,.416,.295,.083,.29,.577,.31,.547,.707,.583,.053,1],[.499,.422,.295,.08,.283,.573,.297,.557,.713,.58,.033,1],[.499,.423,.295,.08,.283,.577,.3,.557,.713,.58,.033,1],[.441,.621,.145,.102,.183,.53,.38,.337,.763,.463,.077,1],[.428,.627,.127,.115,.18,.533,.393,.33,.757,.46,.08,1],[.423,.628,.12,.118,.18,.537,.37,.33,.757,.447,.077,1],[.421,.629,.115,.122,.18,.54,.407,.327,.753,.457,.077,1],[.421,.629,.115,.122,.18,.54,.397,.327,.753,.457,.077,33],[.465,.601,.132,.133,.193,.48,.447,.283,.773,.45,.08,1],[.482,.588,.135,.137,.203,.463,.44,.27,.78,.447,.077,1],[.49,.581,.137,.137,.207,.45,.447,.263,.78,.453,.077,1],[.494,.577,.137,.137,.21,.45,.49,.257,.783,.447,.08,1],[.496,.576,.137,.137,.213,.453,.46,.257,.783,.45,.077,1],[.498,.574,.137,.137,.213,.45,.493,.253,.783,.45,.08,1],[.498,.574,.138,.137,.213,.447,.477,.253,.783,.45,.08,1],[.499,.574,.137,.137,.213,.447,.473,.253,.783,.45,.08,1],[.499,.573,.137,.137,.213,.443,.47,.253,.783,.45,.08,21]];

    // Blinking animation frames (60 frames)
    const BLINKING_RLE = [
        [0.500,0.573,0.138,0.138,0.000, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.430,0.211,0.000,0.192, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.437,0.212,0.000,0.190, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.438,0.212,0.000,0.188, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.573,0.139,0.087,0.068, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.573,0.130,0.112,0.067, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.573,0.127,0.118,0.067, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.500,0.573,0.126,0.122,0.065, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.500,0.573,0.126,0.126,0.065, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.573,0.125,0.127,0.063, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 25],
        [0.500,0.573,0.088,0.088,0.120, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.500,0.573,0.078,0.078,0.133, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 1],
        [0.498,0.573,0.143,0.142,0.000, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 2],
        [0.498,0.573,0.140,0.140,0.000, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 3],
        [0.498,0.573,0.140,0.138,0.000, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 2],
        [0.500,0.573,0.138,0.138,0.000, 0.213,0.443,0.470,0.253,0.783,0.450,0.080, 17],
    ];

    // Expand RLE data
    const LOOKING_FRAMES = expandRLE(LOOKING_RLE, 11);
    const BLINKING_FRAMES = expandRLE(BLINKING_RLE, 12);

    function expandRLE(rle, dataLength) {
        const frames = [];
        for (const entry of rle) {
            const count = entry[dataLength];
            const frame = entry.slice(0, dataLength);
            for (let i = 0; i < count; i++) frames.push(frame);
        }
        return frames;
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    function buildArcPath(lx, ly, px, py, rx, ry) {
        const cpx = 2 * px - 0.5 * (lx + rx);
        const cpy = 2 * py - 0.5 * (ly + ry);
        return `M ${lx} ${ly} Q ${cpx} ${cpy} ${rx} ${ry}`;
    }

    function applyLookingFrame(frameData, eyeball, eyelid, scale = 100) {
        const [ecx, ecy, erx, ery, lx, ly, px, py, rx, ry, sw] = frameData;

        eyeball.setAttribute('cx', ecx * scale);
        eyeball.setAttribute('cy', ecy * scale);
        eyeball.setAttribute('rx', erx * scale);
        eyeball.setAttribute('ry', ery * scale);
        eyeball.setAttribute('fill', 'var(--rust)');
        eyeball.setAttribute('stroke', 'none');

        const arcPath = buildArcPath(lx * scale, ly * scale, px * scale, py * scale, rx * scale, ry * scale);
        eyelid.setAttribute('d', arcPath);
        eyelid.setAttribute('stroke-width', sw * scale);
    }

    function applyBlinkingFrame(frameData, eyeball, eyelid, scale = 100) {
        const [ecx, ecy, erx, ery, esw, lx, ly, px, py, rx, ry, lsw] = frameData;
        const isRing = esw > 0;

        eyeball.setAttribute('cx', ecx * scale);
        eyeball.setAttribute('cy', ecy * scale);

        if (isRing) {
            const actualRy = Math.max(ery, 0.001);
            eyeball.setAttribute('rx', erx * scale);
            eyeball.setAttribute('ry', actualRy * scale);
            eyeball.setAttribute('fill', 'none');
            eyeball.setAttribute('stroke', 'var(--rust)');
            eyeball.setAttribute('stroke-width', esw * scale);
        } else {
            eyeball.setAttribute('rx', erx * scale);
            eyeball.setAttribute('ry', ery * scale);
            eyeball.setAttribute('fill', 'var(--rust)');
            eyeball.setAttribute('stroke', 'none');
            eyeball.setAttribute('stroke-width', '0');
        }

        const arcPath = buildArcPath(lx * scale, ly * scale, px * scale, py * scale, rx * scale, ry * scale);
        eyelid.setAttribute('d', arcPath);
        eyelid.setAttribute('stroke-width', lsw * scale);
    }

    // ============================================================================
    // HERO EYE FUNCTIONS
    // ============================================================================

    function createHeroEye() {
        heroEyeContainer = document.createElement('div');
        heroEyeContainer.id = 'hero-eye-container';
        heroEyeContainer.className = 'hero-eye-container';

        heroEyeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heroEyeSvg.setAttribute('viewBox', '0 0 100 100');
        heroEyeSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        heroEyeSvg.id = 'hero-eye-svg';

        heroEyeball = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        heroEyeball.id = 'hero-eyeball';

        heroEyelid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        heroEyelid.id = 'hero-eyelid';
        heroEyelid.setAttribute('fill', 'none');
        heroEyelid.setAttribute('stroke', 'var(--text)');
        heroEyelid.setAttribute('stroke-linecap', 'round');

        heroEyeSvg.appendChild(heroEyeball);
        heroEyeSvg.appendChild(heroEyelid);
        heroEyeContainer.appendChild(heroEyeSvg);

        const heroNameWrap = document.querySelector('.hero-name-wrap');
        if (heroNameWrap) {
            heroNameWrap.appendChild(heroEyeContainer);
        }
    }

    function animateHeroEye() {
        if (!heroEyeball || !heroEyelid || !state.heroEyeActive) return;

        applyLookingFrame(LOOKING_FRAMES[state.currentFrame], heroEyeball, heroEyelid, 100);
        state.currentFrame = (state.currentFrame + 1) % LOOKING_FRAMES.length;

        heroAnimationId = setTimeout(() => {
            requestAnimationFrame(animateHeroEye);
        }, CONFIG.frameInterval);
    }

    function hideHeroEye() {
        state.heroEyeActive = false;

        if (heroAnimationId) {
            clearTimeout(heroAnimationId);
            heroAnimationId = null;
        }

        // Simple fade out transition
        if (heroEyeContainer) {
            heroEyeContainer.style.transition = 'opacity 0.3s ease-out';
            heroEyeContainer.style.opacity = '0';
            
            setTimeout(() => {
                if (heroEyeContainer) {
                    heroEyeContainer.style.display = 'none';
                }
            }, 300);
        }
    }

    function showHeroEyeReturn() {
        // Recreate hero eye if it was removed
        if (!heroEyeContainer || !heroEyeContainer.parentNode) {
            createHeroEye();
        }
        
        state.heroEyeActive = true;
        state.phase = 'hero-return';
        
        if (heroEyeContainer) {
            heroEyeContainer.style.display = 'block';
            heroEyeContainer.style.transition = 'opacity 0.3s ease-in';
            heroEyeContainer.style.opacity = '1';
        }
        
        // Start hero eye animation
        state.currentFrame = 0;
        animateHeroEye();
    }

    // ============================================================================
    // CURSOR FUNCTIONS
    // ============================================================================

    function createCursor() {
        cursorContainer = document.createElement('div');
        cursorContainer.id = 'cursor-container';
        cursorContainer.className = 'blinking medium';

        // Create frosted glass backdrop element
        const glassBackdrop = document.createElement('div');
        glassBackdrop.id = 'cursor-glass-backdrop';
        glassBackdrop.className = 'cursor-glass-backdrop';

        cursorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cursorSvg.id = 'cursor-svg';
        cursorSvg.setAttribute('viewBox', '0 0 100 100');
        cursorSvg.setAttribute('width', CONFIG.cursorSize);
        cursorSvg.setAttribute('height', CONFIG.cursorSize);

        cursorEyeball = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        cursorEyeball.id = 'c-eyeball';

        cursorEyelid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        cursorEyelid.id = 'c-eyelid';
        cursorEyelid.setAttribute('fill', 'none');
        cursorEyelid.setAttribute('stroke', 'var(--text)');
        cursorEyelid.setAttribute('stroke-linecap', 'round');

        cursorSvg.appendChild(cursorEyeball);
        cursorSvg.appendChild(cursorEyelid);
        
        // Create scroll pill element
        const scrollPill = document.createElement('div');
        scrollPill.className = 'cursor-scroll-pill';
        scrollPill.innerHTML = '<span style="display:flex;align-items:center;gap:6px">SCROLL <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v12m-4-4l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
        
        // Create dragger arrows element
        const draggerArrows = document.createElement('div');
        draggerArrows.className = 'cursor-dragger-arrows';
        draggerArrows.innerHTML = `
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,3 2,8 6,13" stroke="var(--rust)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="10,3 14,8 10,13" stroke="var(--rust)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
        `;
        
        // Append glass backdrop first (behind), then SVG, then pill, then dragger arrows
        cursorContainer.appendChild(glassBackdrop);
        cursorContainer.appendChild(cursorSvg);
        cursorContainer.appendChild(scrollPill);
        cursorContainer.appendChild(draggerArrows);

        document.body.appendChild(cursorContainer);
    }

    function showCursor() {
        if (!cursorContainer) {
            createCursor();
        }
        
        if (cursorContainer) {
            cursorContainer.style.display = 'block';
            cursorContainer.style.opacity = '1';
        }
        
        state.cursorActive = true;
        state.currentFrame = 0;
        state.lookingCycleComplete = false;
        switchToBlinking();
    }

    function hideCursor() {
        state.cursorActive = false;
        
        if (cursorAnimationId) {
            clearTimeout(cursorAnimationId);
            cursorAnimationId = null;
        }
        if (cursorRafId) {
            cancelAnimationFrame(cursorRafId);
            cursorRafId = null;
        }
        
        if (cursorContainer) {
            cursorContainer.style.transition = 'opacity 0.3s ease-out';
            cursorContainer.style.opacity = '0';
            
            setTimeout(() => {
                if (cursorContainer) {
                    cursorContainer.style.display = 'none';
                }
            }, 300);
        }
    }

    function switchToBlinking() {
        if (state.phase === 'blinking') return;
        state.phase = 'blinking';
        state.currentFrame = 0;
        state.lookingCycleComplete = false;
        
        if (cursorContainer) cursorContainer.className = 'blinking medium';
        if (cursorAnimationId) {
            clearTimeout(cursorAnimationId);
            cursorAnimationId = null;
        }
        if (cursorRafId) {
            cancelAnimationFrame(cursorRafId);
            cursorRafId = null;
        }
        
        // Clear residual GSAP inline styles that erase eyebrow
        if (window.gsap && cursorEyeball && cursorEyelid) {
            gsap.set(cursorEyeball, { clearProps: "all" });
            gsap.set(cursorEyelid, { clearProps: "all" });
        }
        
        animateCursorBlinking();
    }

    function switchToLooking() {
        if (state.phase === 'looking') return;
        state.phase = 'looking';
        state.currentFrame = 0;
        
        if (cursorContainer) cursorContainer.className = 'looking medium';
        if (cursorAnimationId) {
            clearTimeout(cursorAnimationId);
            cursorAnimationId = null;
        }
        if (cursorRafId) {
            cancelAnimationFrame(cursorRafId);
            cursorRafId = null;
        }
        
        if (window.gsap && cursorEyeball && cursorEyelid) {
            gsap.set(cursorEyeball, { clearProps: "all" });
            gsap.set(cursorEyelid, { clearProps: "all" });
        }
        
        animateCursorLooking();
    }

    function animateCursorBlinking() {
        if (!cursorEyeball || !cursorEyelid || !state.cursorActive || state.phase !== 'blinking') return;

        applyBlinkingFrame(BLINKING_FRAMES[state.currentFrame], cursorEyeball, cursorEyelid, 100);
        state.currentFrame = (state.currentFrame + 1) % BLINKING_FRAMES.length;

        cursorAnimationId = setTimeout(() => {
            cursorRafId = requestAnimationFrame(animateCursorBlinking);
        }, CONFIG.frameInterval);
    }

    function animateCursorLooking() {
        if (!cursorEyeball || !cursorEyelid || !state.cursorActive || state.phase !== 'looking') return;

        applyLookingFrame(LOOKING_FRAMES[state.currentFrame], cursorEyeball, cursorEyelid, 100);
        state.currentFrame = (state.currentFrame + 1) % LOOKING_FRAMES.length;

        // Check if we completed one full cycle (500 frames)
        if (state.currentFrame === 0 && !state.lookingCycleComplete) {
            state.lookingCycleComplete = true;
            
            // If in hero section, transition to hero eye
            if (state.isInHeroSection) {
                hideCursor();
                showHeroEyeReturn();
                return; // Stop cursor animation
            }
        }

        cursorAnimationId = setTimeout(() => {
            cursorRafId = requestAnimationFrame(animateCursorLooking);
        }, CONFIG.frameInterval);
    }

    function updateCursorPosition() {
        if (state.isVisible && cursorContainer) {
            if (!state.isMorphingHero) {
                cursorContainer.style.transform = 
                    `translate3d(${state.mouseX}px, ${state.mouseY}px, 0) translate(-50%, -50%)`;
            }
            if (!state.isMorphingHero) {
                cursorContainer.style.opacity = '1';
            }
        } else if (cursorContainer && !state.isMorphingHero) {
            cursorContainer.style.opacity = '0';
        }
        requestAnimationFrame(updateCursorPosition);
    }

    // ============================================================================
    // SCROLL STORY DETECTION
    // ============================================================================

    function checkScrollStorySection() {
        const scrollStoryWrapper = document.getElementById('scroll-story-wrapper');
        if (!scrollStoryWrapper) {
            state.isInScrollStory = false;
            state.isForcedLooking = false;
            return;
        }
        
        const rect = scrollStoryWrapper.getBoundingClientRect();
        
        const isHoveringStory = (
            state.mouseX >= rect.left &&
            state.mouseX <= rect.right &&
            state.mouseY >= rect.top &&
            state.mouseY <= rect.bottom
        );
        
        const wasInScrollStory = state.isInScrollStory;
        state.isInScrollStory = isHoveringStory;
        
        if (isHoveringStory) {
            const isStoryInFocus = rect.top <= 150 && rect.bottom >= 150;
            if (isStoryInFocus) {
                state.isForcedLooking = true;
                if (state.phase === 'scroll-pill' || state.phase === 'blinking') {
                    switchToLooking();
                }
            } else {
                state.isForcedLooking = false;
                if (state.phase === 'blinking' || state.phase === 'looking') {
                    switchToScrollPill();
                }
            }
        } else {
            state.isForcedLooking = false;
            if (wasInScrollStory) {
                if (state.phase === 'scroll-pill' || state.phase === 'looking') {
                    switchToBlinking();
                }
            }
        }
    }

    function switchToScrollPill() {
        if (state.phase === 'scroll-pill') return;
        
        state.phase = 'scroll-pill';
        
        if (cursorContainer) {
            cursorContainer.className = 'scroll-pill medium';
        }
        
        if (cursorAnimationId) {
            clearTimeout(cursorAnimationId);
            cursorAnimationId = null;
        }
        if (cursorRafId) {
            cancelAnimationFrame(cursorRafId);
            cursorRafId = null;
        }
    }

    function handleScrollInStory() {
        // Replaced by checkScrollStorySection hover logic
    }

    // ============================================================================
    // SLIDER DRAGGER DETECTION
    // ============================================================================

    function checkSliderSection(clientX, clientY) {
        const sliderContainers = document.querySelectorAll('.before-after-container');
        if (!sliderContainers.length) {
            state.isOverSlider = false;
            return;
        }
        
        let isOverAnySlider = false;
        
        for (const container of sliderContainers) {
            const rect = container.getBoundingClientRect();
            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                isOverAnySlider = true;
                break;
            }
        }
        
        const wasOverSlider = state.isOverSlider;
        state.isOverSlider = isOverAnySlider;
        
        // Entering slider area
        if (isOverAnySlider && !wasOverSlider) {
            switchToDragger();
        }
        // Leaving slider area
        else if (!isOverAnySlider && wasOverSlider) {
            if (state.phase === 'dragger') {
                switchToBlinking();
            }
        }
    }

    function switchToDragger() {
        if (state.phase === 'dragger') return;
        
        state.phase = 'dragger';
        
        if (cursorContainer) {
            cursorContainer.className = 'dragger medium';
        }
        
        // Stop any cursor animations
        if (cursorAnimationId) {
            clearTimeout(cursorAnimationId);
            cursorAnimationId = null;
        }
        if (cursorRafId) {
            cancelAnimationFrame(cursorRafId);
            cursorRafId = null;
        }
    }

    // ============================================================================
    // ACTIVITY TRACKING
    // ============================================================================

    function resetInactivityTimer() {
        if (state.inactivityTimer) {
            clearTimeout(state.inactivityTimer);
        }

        if (state.cursorActive && state.phase === 'looking' && !state.isForcedLooking) {
            switchToBlinking();
        }

        state.inactivityTimer = setTimeout(() => {
            if (state.cursorActive && state.phase === 'blinking') {
                switchToLooking();
            }
        }, CONFIG.inactivityTimeout);
    }

    function handleActivity() {
        // Prevent phantom scroll events from shooting the eye off-screen
        // before the mouse has actually entered the viewport
        if (state.mouseX === -200 && state.mouseY === -200) {
            return;
        }

        // If hero eye is showing (returned state), hide it and show cursor
        if (state.phase === 'hero-return' && state.heroEyeActive) {
            hideHeroEye();
            showCursor();
            return;
        }
        
        // First mouse movement - transition from hero to cursor
        if (!state.hasFirstMouseMove || (state.phase === 'hero' && state.heroEyeActive)) {
            state.hasFirstMouseMove = true;
            
            if (!cursorContainer) {
                showCursor(); // ensure it exists
            }
            
            if (window.gsap && heroEyeContainer && cursorContainer && heroEyeContainer.parentNode) {
                const rect = heroEyeContainer.getBoundingClientRect();
                const heroInViewport = rect.bottom > 0 && rect.top < window.innerHeight;
                
                // Hero is off-screen — skip morph, snap cursor to mouse
                if (!heroInViewport) {
                    hideHeroEye();
                    cursorContainer.style.transform = `translate3d(${state.mouseX}px, ${state.mouseY}px, 0) translate(-50%, -50%)`;
                    showCursor();
                    return;
                }
                
                const scale = rect.width / CONFIG.cursorSize;
                
                state.isMorphingHero = true;
                cursorContainer.style.opacity = '1';
                cursorContainer.style.display = 'block';
                
                state.morphT = 0;
                const startX = rect.left + rect.width / 2;
                const startY = rect.top + rect.height / 2;
                
                gsap.to(state, {
                    morphT: 1,
                    duration: 0.35,
                    ease: "power3.out",
                    onUpdate: () => {
                        const currentX = startX + (state.mouseX - startX) * state.morphT;
                        const currentY = startY + (state.mouseY - startY) * state.morphT;
                        const currentScale = scale + (1 - scale) * state.morphT;
                        if (cursorContainer) {
                            cursorContainer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${currentScale})`;
                        }
                    },
                    onComplete: () => {
                        state.isMorphingHero = false;
                    }
                });
                
                hideHeroEye();
            } else {
                hideHeroEye();
                if (cursorContainer) {
                    // pre-snap to coordinates so it doesn't slide from (-200, -200)
                    cursorContainer.style.transform = `translate3d(${state.mouseX}px, ${state.mouseY}px, 0) translate(-50%, -50%)`;
                }
                showCursor();
            }
            return;
        }

        // If cursor is not active but should be, reactivate it
        if (!state.cursorActive && state.hasFirstMouseMove && !state.heroEyeActive) {
            showCursor();
            return;
        }

        // Reset inactivity timer on any activity
        if (state.cursorActive) {
            resetInactivityTimer();
        }
    }

    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================

    function setupEventListeners() {
        // Get hero section element
        const heroSection = document.querySelector('.hero');
        
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
            
            if (!state.isVisible) {
                state.isVisible = true;
            }

            // Check if mouse is in hero section
            if (heroSection) {
                const rect = heroSection.getBoundingClientRect();
                const wasInHero = state.isInHeroSection;
                state.isInHeroSection = (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                );
            }

            // Check scroll story section
            checkScrollStorySection();
            
            // Check slider section
            checkSliderSection(e.clientX, e.clientY);

            handleActivity();
        }, { passive: true });

        // Mouse enter/leave viewport
        document.addEventListener('mouseenter', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
            state.isVisible = true;
            handleActivity();
        });

        document.addEventListener('mouseleave', () => {
            state.isVisible = false;
        });

        // Scroll activity
        window.addEventListener('scroll', () => {
            // Update hero section detection on scroll
            if (heroSection && state.mouseX !== -200) {
                const rect = heroSection.getBoundingClientRect();
                state.isInHeroSection = (
                    state.mouseX >= rect.left &&
                    state.mouseX <= rect.right &&
                    state.mouseY >= rect.top &&
                    state.mouseY <= rect.bottom
                );
            }
            
            // Check scroll story section
            checkScrollStorySection();
            
            // Check slider section (so dragger updates on scroll, not just mousemove)
            checkSliderSection(state.mouseX, state.mouseY);
            
            // Handle scroll within story
            handleScrollInStory();
            
            handleActivity();
        }, { passive: true });
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function init() {
        // Create and start hero eye
        createHeroEye();
        animateHeroEye();

        // Setup event listeners
        setupEventListeners();

        // Check scroll story section on page load (after DOM is ready)
        setTimeout(() => {
            checkScrollStorySection();
        }, 100);

        // Start cursor position update loop (even though cursor is hidden initially)
        requestAnimationFrame(updateCursorPosition);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for debugging/external control
    window.EyeCursorSystem = {
        getState: () => ({ ...state }),
        forceBlinking: () => switchToBlinking(),
        forceLooking: () => switchToLooking(),
        setInactivityTimeout: (ms) => { CONFIG.inactivityTimeout = ms; }
    };

})();

// Made with Bob