/* =====================================================================
   render.js  —  fetches /data/content.json and builds the entire page.

   ARCHITECTURE:
     1. loadPage() kicks off the JSON fetch (async)
     2. main.js is loaded synchronously right after this script, so
        initPage() is already defined by the time the fetch resolves.
     3. After rendering, initPage() is called to wire up UI behaviour.

   LANGUAGES:  ru (Russian) · en (English) · ady (Adyghe) · tr (Turkish)
   PALETTES:   defined in theme.css, controlled by theme-config.js
   ===================================================================== */

// ── Language system ───────────────────────────────────────────────────
const LANGS       = ['ru', 'en', 'ady', 'tr'];
const LANG_LABELS = { ru: 'РУ', en: 'EN', ady: 'АДЫ', tr: 'TR' };
const HTML_LANG   = { ru: 'ru', en: 'en', ady: 'kbd', tr: 'tr' };

let lang = localStorage.getItem('lang') || 'ru';
if (!LANGS.includes(lang)) lang = 'ru';

/** Pick the right string from a { ru, en, ady, tr } object. */
function t(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.ru || '';
}

/** Build data-ru/en/tr/ady attribute string for an element. */
function dataAttrs(obj) {
    if (!obj || typeof obj === 'string') return '';
    const safe = s => (s || '').replace(/"/g, '&quot;');
    return `data-ru="${safe(obj.ru)}" data-en="${safe(obj.en || obj.ru)}" data-ady="${safe(obj.ady || obj.ru)}" data-tr="${safe(obj.tr || obj.ru)}"`;
}

/** Switch language and update all translatable DOM elements. */
function setLang(l) {
    lang = l;
    localStorage.setItem('lang', l);
    document.documentElement.lang = HTML_LANG[l] || 'ru';
    document.querySelectorAll('[data-ru]').forEach(el => {
        el.textContent = el.dataset[l] || el.dataset.ru;
    });
    document.querySelectorAll('.item-link').forEach(el => {
        el.textContent = UI.read_more[l] || UI.read_more.ru;
    });
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = LANG_LABELS[l];
}

// ── Static UI strings (rendered in JS, not from content.json) ─────────
const UI = {
    read_more: { ru: 'Подробнее →', en: 'Read more →', ady: 'НэхъыбэкIэ →', tr: 'Devamını oku →' }
};

// ── Inline link parser:  [text](url)  →  <a href="url">text</a> ──────
function parseLinks(text) {
    if (!text) return '';
    return text
        .replace(/!!([^!]+)!!/g, '<span class="text-badge">$1</span>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(
            /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
}

// ── SVG icon library ─────────────────────────────────────────────────
const ICONS = {
    phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.42 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.72 6.72l1.74-1.74a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/></svg>`,
    email: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
    youtube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    telegram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>`,
    vk: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.785 16.241s.285-.032.43-.194c.132-.148.127-.427.127-.427s-.019-1.305.587-1.497c.597-.19 1.363 1.26 2.177 1.817.614.422 1.08.33 1.08.33l2.17-.03s1.135-.071.597-1.022c-.044-.075-.314-.704-1.62-1.99-1.366-1.344-1.184-1.127.462-3.453.999-1.333 1.398-2.147 1.273-2.495-.12-.333-.854-.245-.854-.245l-2.44.015s-.181-.025-.315.058c-.132.08-.217.27-.217.27s-.387 1.09-.903 2.016c-1.088 1.964-1.524 2.069-1.702 1.946-.414-.268-.31-1.076-.31-1.65 0-1.794.272-2.542-.529-2.737-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.026.208-.278.135-.492.437-.361.454.161.021.526.104.72.38.25.356.241 1.154.241 1.154s.143 2.112-.334 2.373c-.327.177-.776-.184-1.739-1.835-.494-.904-.867-1.904-.867-1.904s-.072-.177-.202-.272a1.003 1.003 0 0 0-.378-.136l-2.32.015s-.349.01-.477.162C4.02 8.54 4.125 8.87 4.125 8.87s1.818 4.259 3.876 6.406c1.888 1.974 4.031 1.845 4.031 1.845h.972l-.219-.88z"/></svg>`,
    facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    ok: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 5.333a3.667 3.667 0 1 1 0 7.334 3.667 3.667 0 0 1 0-7.334zm0 2.084a1.583 1.583 0 1 0 0 3.166 1.583 1.583 0 0 0 0-3.166zm4.117 6.41a6.714 6.714 0 0 1-2.783 1.116l2.45 2.45a1.042 1.042 0 0 1-1.473 1.473L12 16.545l-2.311 2.321a1.042 1.042 0 0 1-1.473-1.473l2.45-2.45a6.714 6.714 0 0 1-2.783-1.116 1.042 1.042 0 1 1 1.234-1.686A4.638 4.638 0 0 0 12 13.5a4.638 4.638 0 0 0 2.883-.941 1.042 1.042 0 1 1 1.234 1.686v-.001z"/></svg>`,
    whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
    default: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
};

function icon(type) {
    return ICONS[type] || ICONS.default;
}

// ── Render: Navbar ────────────────────────────────────────────────────
function renderNav(c) {
    const nav = document.querySelector('.navbar');
    const n = c.nav;

    nav.innerHTML = `
        <div class="nav-container">
            <a href="/" class="logo" aria-label="На главную"></a>
            <ul class="nav-links" id="navLinks" role="list">
                <li><a href="#home"      ${dataAttrs(n.home)}>${t(n.home)}</a></li>
                <li><a href="#about"     ${dataAttrs(n.about)}>${t(n.about)}</a></li>
                <li><a href="#activity"  ${dataAttrs(n.activity)}>${t(n.activity)}</a></li>
                <li><a href="#education" ${dataAttrs(n.education)}>${t(n.education)}</a></li>
                <li><a href="#contact"   ${dataAttrs(n.contact)}>${t(n.contact)}</a></li>
            </ul>
            <div class="nav-actions">
                <button id="langToggle" class="lang-toggle"
                    title="Switch language / Бзэ зэблэхъун"
                    aria-label="Switch language">${LANG_LABELS[lang]}</button>
                <button id="themeToggle" class="theme-toggle"
                    title="Тёмная/светлая тема"
                    aria-label="Toggle dark mode">🌙</button>
                <button id="paletteToggle" class="palette-toggle"
                    title="Сменить цвет / Change colour"
                    aria-label="Change colour palette"></button>
                <button class="mobile-menu-toggle" id="mobileMenuToggle"
                    aria-label="Открыть меню" aria-expanded="false" aria-controls="navLinks">☰</button>
            </div>
        </div>`;

    document.getElementById('langToggle').addEventListener('click', () => {
        const next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
        setLang(next);
    });
}

// ── Render: Hero ──────────────────────────────────────────────────────
function renderHome(h, meta) {
    const section = document.createElement('section');
    section.id = 'home';
    section.className = 'hero';

    const avatarHTML = h.photo
        ? `<div class="hero-avatar"><img src="${h.photo}" alt="${meta.name}" loading="eager"></div>`
        : '';

    const socialHTML = (h.social || []).map(s =>
        `<a href="${s.url}" class="hero-social-link"
            target="_blank" rel="noopener noreferrer">${s.type ? `<span class="hero-social-icon hero-social-icon--${s.type}">${icon(s.type)}</span>` : ''}${s.label}</a>`
    ).join('');

    section.innerHTML = `
        <div class="hero-content">
            ${avatarHTML}
            <h1 ${dataAttrs(h.name)}>${t(h.name)}</h1>
            <p class="subtitle" ${dataAttrs(h.subtitle)}>${t(h.subtitle)}</p>
            <div class="cta-buttons">
                <a href="#about" class="cta-button" ${dataAttrs(h.cta)}>${t(h.cta)}</a>
            </div>
            ${socialHTML ? `<div class="hero-social">${socialHTML}</div>` : ''}
        </div>`;

    return section;
}

// ── Render: About ─────────────────────────────────────────────────────
function renderAbout(a) {
    const section = document.createElement('section');
    section.id = 'about';

    const rowsHTML = a.projects.map((p, i) => {
        const para = a.paragraphs[i] ?? '';
        return `
        <div class="about-row fade-in">
            <div class="project-card">
                <div class="project-card-top">
                    <div class="project-icon" aria-hidden="true">${p.icon}</div>
                    <div class="project-body">
                        <h4>${p.url
                            ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">${t(p.title)}</a>`
                            : t(p.title)}</h4>
                    </div>
                </div>
            </div>
            <p class="about-para">${parseLinks(t(para))}</p>
        </div>`;
    }).join('');

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title fade-in" ${dataAttrs(a.title)}>${t(a.title)}</h2>
            <div class="about-rows">${rowsHTML}</div>
        </div>`;

    return section;
}

// ── Render: Activity ──────────────────────────────────────────────────
function renderActivity(act) {
    const section = document.createElement('section');
    section.id = 'activity';

    const itemsHTML = act.items.map(item => `
        <div class="timeline-card fade-in">
            <div class="timeline-dot" aria-hidden="true"></div>
            <div class="timeline-card-body">
                <div class="timeline-card-header">
                    <div class="timeline-card-info">
                        <h3>${item.title}</h3>
                        <p class="timeline-org">${item.organization}</p>
                    </div>
                    <span class="timeline-period">${item.period}</span>
                </div>
                <p>${parseLinks(item.description)}</p>
                ${item.url
                    ? `<a href="${item.url}" class="item-link"
                          target="_blank" rel="noopener noreferrer">${t(UI.read_more)}</a>`
                    : ''}
            </div>
        </div>`
    ).join('');

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title fade-in" ${dataAttrs(act.title)}>${t(act.title)}</h2>
            <div class="timeline-list">${itemsHTML}</div>
        </div>`;

    return section;
}

// ── Render: Education ─────────────────────────────────────────────────
function renderEducation(edu) {
    const section = document.createElement('section');
    section.id = 'education';

    const locationIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const itemsHTML = edu.items.map(item => `
        <div class="timeline-card fade-in">
            <div class="timeline-dot" aria-hidden="true"></div>
            <div class="timeline-card-body">
                <div class="timeline-card-header">
                    <div class="timeline-card-info">
                        <h3>${item.degree}</h3>
                        <p class="timeline-org">${item.institution}</p>
                    </div>
                    <span class="timeline-period">${item.period}</span>
                </div>
                <div class="edu-meta">${locationIcon} ${item.location}</div>
                <div class="edu-tags">
                    ${item.highlights.map(h => `<span class="edu-tag">${h}</span>`).join('')}
                </div>
            </div>
        </div>`
    ).join('');

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title fade-in" ${dataAttrs(edu.title)}>${t(edu.title)}</h2>
            <div class="timeline-list">${itemsHTML}</div>
        </div>`;

    return section;
}

// ── Render: Contact ───────────────────────────────────────────────────
function renderContact(contact) {
    const section = document.createElement('section');
    section.id = 'contact';

    const isExternal = type => type !== 'phone' && type !== 'email';

    const itemsHTML = contact.items.map(item => `
        <div class="contact-item">
            <div class="contact-icon contact-icon--${item.type}">${icon(item.type)}</div>
            <div class="contact-item-body">
                ${item.hint ? `<span class="hint">${item.hint}</span>` : ''}
                <a href="${item.url}"${isExternal(item.type)
                    ? ' target="_blank" rel="noopener noreferrer"' : ''}>${item.label}</a>
            </div>
        </div>`
    ).join('');

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title fade-in" ${dataAttrs(contact.title)}>${t(contact.title)}</h2>
            <div class="contact-wrapper">
                <p class="contact-intro fade-in" ${dataAttrs(contact.intro)}>${t(contact.intro)}</p>
                <div class="contact-items fade-in">${itemsHTML}</div>
            </div>
        </div>`;

    return section;
}

// ── Render: Footer ────────────────────────────────────────────────────
function renderFooter(c) {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const year = new Date().getFullYear();
    footer.innerHTML = `
        <div class="container">
            <p>© ${year} <span ${dataAttrs(c.footer.name)}>${t(c.footer.name)}</span></p>
            <p class="footer-disclaimer">Instagram и Facebook — продукты компании Meta, деятельность которой запрещена и признана на территории РФ экстремистской. Также экстремистскими признаны WhatsApp и Telegram.</p>
        </div>
    `;
}

// ── Main entry ────────────────────────────────────────────────────────
async function loadPage() {
    try {
        const res = await fetch('/data/content.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const c = await res.json();

        const mount   = document.getElementById('all-sections');
        const loading = document.getElementById('loading-indicator');

        renderNav(c);

        mount.appendChild(renderHome(c.home, c.meta));
        mount.appendChild(renderAbout(c.about));
        mount.appendChild(renderActivity(c.activity));
        mount.appendChild(renderEducation(c.education));
        mount.appendChild(renderContact(c.contact));

        renderFooter(c);

        if (loading) loading.remove();

        // Wire up UI behaviours defined in main.js (loaded after this script)
        if (typeof initPage === 'function') initPage();

    } catch (err) {
        console.error('Ошибка загрузки контента:', err);
        const loading = document.getElementById('loading-indicator');
        if (loading) {
            loading.textContent = 'Ошибка загрузки. Обновите страницу.';
            loading.style.cssText = 'color:#888;font-size:0.9rem;letter-spacing:0;text-transform:none;';
        }
    }
}

loadPage();
