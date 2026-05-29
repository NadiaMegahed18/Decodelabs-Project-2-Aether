/* ==========================================================================
   AETHER CLIENT LOGIC - INTERACTIVE PRESENTATION ENGINE
   --------------------------------------------------------------------------
   TECHNICAL FEATURES IMPLEMENTED:
   - Fluid slide navigation via CSS scroll-snapping integration
   - Real-time slide indexing, progress bar, and badge indicators
   - Responsive Popover API menu auto-close (Slide 14)
   - Real-time clamp() font-size calculator (Slide 13)
   - Layout grid wireframe toggle & flex alignments (Slide 12)
   - Keyboard accessibility support (Arrow keys)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // 1. SLIDESHOW NAVIGATION & SCROLL TRACKING
    // ======================================================================
    const viewport = document.querySelector('.slide-viewport');
    const slides = document.querySelectorAll('.slide-card');
    const menuLinks = document.querySelectorAll('.menu-link');
    const currentSlideNum = document.getElementById('current-slide-num');
    const progressBar = document.getElementById('slideshow-progress-bar');
    const btnPrev = document.getElementById('btn-prev-slide');
    const btnNext = document.getElementById('btn-next-slide');
    const popoverSidebar = document.getElementById('slides-menu');
    
    let activeIndex = 0;
    const totalSlides = slides.length;

    // Helper to scroll to specific slide index
    const scrollToSlide = (index) => {
        if (index < 0 || index >= totalSlides) return;
        
        // Find the offset of the target slide
        const targetSlide = slides[index];
        viewport.scrollTo({
            left: targetSlide.offsetLeft,
            behavior: 'smooth'
        });
        
        activeIndex = index;
        updateUI();
    };

    // Update index badges, navigation indicators, and progress line
    const updateUI = () => {
        // Update slide number representation (e.g. 01, 02)
        currentSlideNum.textContent = String(activeIndex + 1).padStart(2, '0');
        
        // Update progress bar width percentage
        const progressPercent = ((activeIndex + 1) / totalSlides) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Update menu links active state class
        menuLinks.forEach((link, idx) => {
            if (idx === activeIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Listen to manual scrolling / swipe events on the snapped container
    const handleScroll = () => {
        // Calculate the current visible slide based on scroll offset ratio
        const scrollLeft = viewport.scrollLeft;
        const width = viewport.clientWidth;
        
        if (width === 0) return;
        
        // Find closest slide index
        const currentIndex = Math.round(scrollLeft / width);
        
        if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < totalSlides) {
            activeIndex = currentIndex;
            updateUI();
        }
    };

    // Debounce scroll listener slightly for better performance
    let scrollTimeout;
    viewport.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 50);
    });

    // Button controls click triggers
    btnPrev.addEventListener('click', () => {
        if (activeIndex > 0) {
            scrollToSlide(activeIndex - 1);
        }
    });

    btnNext.addEventListener('click', () => {
        if (activeIndex < totalSlides - 1) {
            scrollToSlide(activeIndex + 1);
        }
    });

    // Menu sidebar index links clicks triggers
    menuLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetIdx = parseInt(link.getAttribute('data-slide-idx'), 10);
            scrollToSlide(targetIdx);

            // Auto close mobile Popover navigation menu drawer if open (Slide 14)
            if (popoverSidebar.popover && popoverSidebar.matches(':popover-open')) {
                popoverSidebar.hidePopover();
            }
        });
    });

    // Keyboard arrow accessibility triggers
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            scrollToSlide(activeIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            scrollToSlide(activeIndex - 1);
        }
    });

    // Initialize UI positioning
    updateUI();

    // ======================================================================
    // 2. THEME CONTROLLER & PERSISTENCY
    // ======================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');

    const loadThemePreference = () => {
        const pref = localStorage.getItem('aether-theme') || 'dark';
        if (pref === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        const body = document.body;
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('aether-theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('aether-theme', 'dark');
        }
    });

    loadThemePreference(); // init

    // ======================================================================
    // 3. SLIDE 3: INTERACTIVE WORKSPACE SIMULATOR
    // ======================================================================
    const btnToggleGridLines = document.getElementById('btn-toggle-grid-lines');
    const simulatedGrid = document.getElementById('simulated-workspace-grid');
    const btnCardFlexAligns = document.querySelectorAll('.btn-card-flex');
    const sandboxFlexItems = document.getElementById('sandbox-flex-items');

    btnToggleGridLines.addEventListener('click', () => {
        const isWireframe = simulatedGrid.classList.toggle('wireframe-active');
        btnToggleGridLines.textContent = isWireframe ? "Disable Outline Helper" : "Toggle Wireframe Grid";
    });

    btnCardFlexAligns.forEach(btn => {
        btn.addEventListener('click', () => {
            btnCardFlexAligns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const align = btn.getAttribute('data-align');
            if (align === 'column') {
                sandboxFlexItems.classList.add('column');
            } else {
                sandboxFlexItems.classList.remove('column');
            }
        });
    });

    // ======================================================================
    // 4. SLIDE 4: FLUID TYPOGRAPHY clamp() CALCULATOR
    // ======================================================================
    const clampWidthRange = document.getElementById('clamp-width-range');
    const liveViewportW = document.getElementById('live-viewport-w');
    const liveComputedFont = document.getElementById('live-computed-font');
    const interactiveClampHeader = document.getElementById('interactive-clamp-header');

    const updateClampValues = () => {
        const width = clampWidthRange.value;
        liveViewportW.textContent = `${width}px`;

        // Calculate CSS: clamp(1.5rem, 3.5vw, 3.0rem)
        // 1rem = 16px. Min limit = 24px (1.5rem). Max limit = 48px (3.0rem).
        // 3.5vw = width * 0.035.
        const minLimit = 24;
        const maxLimit = 48;
        const scaleFactor = width * 0.035;

        // Perform mathematical clamp
        const computedFont = Math.max(minLimit, Math.min(scaleFactor, maxLimit));
        liveComputedFont.textContent = `${computedFont.toFixed(1)}px`;

        // Resize the card width and apply calculated font size locally
        interactiveClampHeader.parentElement.style.maxWidth = `${width / 16}rem`;
        interactiveClampHeader.style.fontSize = `${computedFont / 16}rem`;
    };

    clampWidthRange.addEventListener('input', updateClampValues);
    updateClampValues(); // init

    // ======================================================================
    // 5. SLIDE 6: NEWSLETTER FORM & INTERN VERIFICATION
    // ======================================================================
    const newsletterForm = document.getElementById('newsletter-form');
    const formSuccessMsg = document.getElementById('form-success-msg');

    newsletterForm.addEventListener('submit', () => {
        newsletterForm.reset();
        formSuccessMsg.classList.remove('hidden');
        setTimeout(() => {
            formSuccessMsg.classList.add('hidden');
        }, 4000);
    });

    // Checklist Verification Status Checks
    const verificationChecks = document.querySelectorAll('.verification-checks input[type="checkbox"]');
    const badgeLockBox = document.getElementById('badge-lock-box');

    const updateChecklistStatus = () => {
        const allChecked = Array.from(verificationChecks).every(cb => cb.checked);
        
        if (allChecked) {
            badgeLockBox.classList.add('unlocked');
            badgeLockBox.classList.remove('locked');
            badgeLockBox.textContent = "STATUS: QUALIFIED 🎖️";
        } else {
            badgeLockBox.classList.add('locked');
            badgeLockBox.classList.remove('unlocked');
            badgeLockBox.textContent = "STATUS: PENDING VERIFICATION";
        }
    };

    verificationChecks.forEach(cb => {
        cb.addEventListener('change', updateChecklistStatus);
    });
    updateChecklistStatus(); // init

});
