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
}

document.addEventListener('DOMContentLoaded', init);
