// 2D Input module

const INPUT_2D_CONFIG = {
    maxHousing: 5000,
    maxSpend: 3000,
    minValue: 0
};

function setup2DInput() {
    const area = document.getElementById('input2dArea');
    const point = document.getElementById('input2dPoint');
    const crosshairH = document.getElementById('crosshairH');
    const crosshairV = document.getElementById('crosshairV');

    if (!area || !point) return;

    let isDragging = false;

    function updatePosition(clientX, clientY) {
        const rect = area.getBoundingClientRect();
        let x = (clientX - rect.left) / rect.width;
        let y = (clientY - rect.top) / rect.height;

        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        point.style.left = (x * 100) + '%';
        point.style.top = (y * 100) + '%';

        crosshairH.style.top = (y * 100) + '%';
        crosshairV.style.left = (x * 100) + '%';

        const spend = Math.round(x * INPUT_2D_CONFIG.maxSpend / 50) * 50;
        const housing = Math.round((1 - y) * INPUT_2D_CONFIG.maxHousing / 50) * 50;

        document.getElementById('everydaySpend').value = spend;
        document.getElementById('housingCost').value = housing;

        if (window.calculator) {
            window.calculator.calculate();
        }
    }

    function startDrag(e) {
        isDragging = true;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        updatePosition(touch.clientX, touch.clientY);
    }

    function moveDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        updatePosition(touch.clientX, touch.clientY);
    }

    function endDrag() {
        isDragging = false;
    }

    area.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    area.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    initializePointPosition();
}

function initializePointPosition() {
    updatePointFromInputs();
}

function updatePointFromInputs() {
    const housing = parseFloat(document.getElementById('housingCost').value) || 0;
    const spend = parseFloat(document.getElementById('everydaySpend').value) || 0;

    const clampedHousing = Math.min(housing, INPUT_2D_CONFIG.maxHousing);
    const clampedSpend = Math.min(spend, INPUT_2D_CONFIG.maxSpend);

    const x = clampedSpend / INPUT_2D_CONFIG.maxSpend;
    const y = 1 - (clampedHousing / INPUT_2D_CONFIG.maxHousing);

    const point = document.getElementById('input2dPoint');
    const crosshairH = document.getElementById('crosshairH');
    const crosshairV = document.getElementById('crosshairV');

    if (point) {
        point.style.left = (x * 100) + '%';
        point.style.top = (y * 100) + '%';
    }
    if (crosshairH) crosshairH.style.top = (y * 100) + '%';
    if (crosshairV) crosshairV.style.left = (x * 100) + '%';
}

function onManualInput() {
    updatePointFromInputs();
    if (window.calculator) {
        window.calculator.calculate();
    }
}

window.input2d = {
    setup: setup2DInput,
    onManualInput: onManualInput
};
