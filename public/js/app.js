// Main application initialization

function updateObsidianSliderState() {
    const obsidianSection = document.getElementById('obsidianMultSection');
    const selectedCard = document.querySelector('input[name="card"]:checked');

    if (obsidianSection && selectedCard) {
        const isObsidian = selectedCard.value === 'obsidian';
        if (isObsidian) {
            obsidianSection.classList.add('visible');
        } else {
            obsidianSection.classList.remove('visible');
        }
    }
}

function updateBiltCashValueVisibility() {
    const section = document.getElementById('biltCashValueSection');
    const selectedOption = document.querySelector('input[name="option"]:checked');

    if (section && selectedOption) {
        if (selectedOption.value === 'flexible') {
            section.classList.add('visible');
        } else {
            section.classList.remove('visible');
        }
    }
}

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
            updateObsidianSliderState();
            if (window.calculator) window.calculator.calculate();
        });
    });

    // Obsidian multiplier slider
    const obsidianSlider = document.getElementById('obsidianMultiplier');
    const obsidianMultValue = document.getElementById('obsidianMultValue');
    if (obsidianSlider) {
        obsidianSlider.addEventListener('input', () => {
            if (obsidianMultValue) {
                obsidianMultValue.textContent = obsidianSlider.value + 'X';
            }
            if (window.calculator) window.calculator.calculate();
        });
    }

    // Initialize slider state
    updateObsidianSliderState();

    document.querySelectorAll('input[name="option"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateBiltCashValueVisibility();
            if (window.calculator) window.calculator.calculate();
        });
    });

    // Bilt Cash Value slider
    const biltCashValueSlider = document.getElementById('biltCashValue');
    const biltCashValueDisplay = document.getElementById('biltCashValueDisplay');
    if (biltCashValueSlider) {
        biltCashValueSlider.addEventListener('input', () => {
            if (biltCashValueDisplay) {
                biltCashValueDisplay.textContent = '$' + parseFloat(biltCashValueSlider.value).toFixed(2);
            }
            if (window.calculator) window.calculator.calculate();
        });
    }

    // Initialize Bilt Cash Value visibility
    updateBiltCashValueVisibility();

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

    // Easter egg
    const easterEggTrigger = document.getElementById('easterEggTrigger');
    const easterEggImg = document.getElementById('easterEggImg');
    if (easterEggTrigger && easterEggImg) {
        const easterEggImages = [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPqFyYQ4zrJoY9vbDx5pHlMB9_f4CHXPquJg&s',
            'https://img.youtube.com/vi/hWlxfdabMz4/0.jpg',
            'https://img.youtube.com/vi/B7whSyo3XCk/0.jpg',
            'https://img.youtube.com/vi/zzncuyE5ME8/0.jpg'
        ];
        easterEggTrigger.addEventListener('mouseenter', () => {
            const randomImg = easterEggImages[Math.floor(Math.random() * easterEggImages.length)];
            easterEggImg.src = randomImg;
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
