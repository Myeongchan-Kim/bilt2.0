// Internationalization module
let translations = {};
let currentLang = 'en';

const languages = ['en', 'ko', 'es'];
const langNames = { en: 'English', ko: '한국어', es: 'Español' };

async function loadTranslations() {
    try {
        // Load directly from JSON file (faster than API cold start)
        const response = await fetch('/data/translations.json');
        const allTranslations = await response.json();
        translations = {};
        for (const [key, values] of Object.entries(allTranslations)) {
            translations[key] = values[currentLang] || values['en'] || '';
        }
        applyTranslations();
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[key]) {
            el.title = translations[key];
        }
    });

    document.querySelectorAll('[data-question-key]').forEach(el => {
        const key = el.getAttribute('data-question-key');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const nextIndex = (languages.indexOf(currentLang) + 1) % languages.length;
        langToggle.textContent = langNames[languages[nextIndex]];
    }

    document.title = 'BILT 2.0 ' + (translations['site_title'] || 'Card Strategy');
}

function toggleLanguage() {
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    currentLang = languages[nextIndex];
    localStorage.setItem('bilt_lang', currentLang);
    loadTranslations();
}

function getTranslation(key) {
    return translations[key] || key;
}

function getCurrentLang() {
    return currentLang;
}

function initI18n() {
    const savedLang = localStorage.getItem('bilt_lang');
    if (savedLang) {
        currentLang = savedLang;
    }
    return loadTranslations();
}

window.i18n = {
    init: initI18n,
    toggle: toggleLanguage,
    get: getTranslation,
    getCurrentLang: getCurrentLang
};
