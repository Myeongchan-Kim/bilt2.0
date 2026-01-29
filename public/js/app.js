// Main application initialization

async function init() {
    if (window.i18n) {
        await window.i18n.init();
    }

    if (window.input2d) {
        window.input2d.setup();
    }

    if (window.calculator) {
        window.calculator.calculate();
    }

    setupEventListeners();
}

function setupEventListeners() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            if (window.i18n) window.i18n.toggle();
        });
    }

    const housingInput = document.getElementById('housingCost');
    const everydayInput = document.getElementById('everydaySpend');

    if (housingInput) {
        housingInput.addEventListener('input', () => {
            if (window.input2d) window.input2d.onManualInput();
        });
    }

    if (everydayInput) {
        everydayInput.addEventListener('input', () => {
            if (window.input2d) window.input2d.onManualInput();
        });
    }

    document.querySelectorAll('input[name="card"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (window.calculator) window.calculator.calculate();
        });
    });

    document.querySelectorAll('input[name="option"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (window.calculator) window.calculator.calculate();
        });
    });

    document.querySelectorAll('input[name="hotelValue"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (window.calculator) window.calculator.calculate();
        });
    });

    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (window.chat) window.chat.handleKeyPress(e);
        });
    }

    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (window.chat) window.chat.send();
        });
    }

    const toggleBtn = document.querySelector('.toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (window.chat) window.chat.toggle();
        });
    }

    document.querySelectorAll('.quick-question').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.chat) window.chat.askQuickQuestion(btn);
        });
    });

    // Results fold/unfold
    const resultsFoldBtn = document.getElementById('resultsFoldBtn');
    const resultsSection = document.getElementById('resultsSection');
    if (resultsFoldBtn && resultsSection) {
        resultsFoldBtn.addEventListener('click', () => {
            resultsSection.classList.toggle('collapsed');
            const foldText = resultsFoldBtn.querySelector('.fold-text');
            if (resultsSection.classList.contains('collapsed')) {
                foldText.setAttribute('data-i18n', 'expand');
                foldText.textContent = window.i18n ? window.i18n.get('expand') : 'Expand';
            } else {
                foldText.setAttribute('data-i18n', 'collapse');
                foldText.textContent = window.i18n ? window.i18n.get('collapse') : 'Collapse';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
