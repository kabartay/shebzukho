/* =====================================================================
   main.js  —  UI behaviours (called by render.js after DOM is built)
   ===================================================================== */

function initPage() {
    initMobileMenu();
    initScrollBehaviours();
    initFadeIn();
    initBackToTop();
    initActiveNav();
    initPalette();
    initTheme();
}

// ── Mobile menu ───────────────────────────────────────────────────────
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('active');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '✕' : '☰';
    });

    // Close when a link is clicked
    links.addEventListener('click', e => {
        if (e.target.tagName === 'A') {
            links.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '☰';
        }
    });

    // Close when clicking outside the nav
    document.addEventListener('click', e => {
        if (!links.contains(e.target) && !toggle.contains(e.target)) {
            links.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '☰';
        }
    });
}

// ── Navbar scroll state + progress bar ───────────────────────────────
function initScrollBehaviours() {
    const navbar   = document.querySelector('.navbar');
    const progress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 80);

        if (progress) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = total > 0
                ? (window.scrollY / total * 100) + '%'
                : '0%';
        }
    }, { passive: true });
}

// ── Fade-in on scroll ─────────────────────────────────────────────────
function initFadeIn() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after first reveal for performance
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    // Use rAF so the browser has painted the newly-added DOM
    requestAnimationFrame(() => {
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    });
}

// ── Back to top button ────────────────────────────────────────────────
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Active nav link via IntersectionObserver ──────────────────────────
function initActiveNav() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('active'));
                const active = document.querySelector(
                    `.nav-links a[href="#${entry.target.id}"]`
                );
                if (active) active.classList.add('active');
            }
        });
    }, {
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0.1
    });

    document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
}

// ── Palette toggle ────────────────────────────────────────────────────
function initPalette() {
    const btn = document.getElementById('paletteToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (typeof window.__cyclePalette === 'function') {
            window.__cyclePalette();
        }
    });
}

// ── Dark mode toggle ─────────────────────────────────────────────────
function initTheme() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const setIcon = (isDark) => { btn.textContent = isDark ? '☀️' : '🌙'; };
    setIcon(document.documentElement.getAttribute('data-theme') === 'dark');
    btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setIcon(next === 'dark');
    });
}
