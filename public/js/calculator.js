// Calculator module

function calculate() {
    const housingCost = parseFloat(document.getElementById('housingCost').value) || 0;
    const everydaySpend = parseFloat(document.getElementById('everydaySpend').value) || 0;
    const card = document.querySelector('input[name="card"]:checked').value;
    const option = document.querySelector('input[name="option"]:checked').value;

    const ratio = housingCost > 0 ? (everydaySpend / housingCost) : 0;
    const ratioPercent = (ratio * 100).toFixed(1);

    let housingMultiplier;
    if (ratio < 0.25) housingMultiplier = 0;
    else if (ratio < 0.50) housingMultiplier = 0.5;
    else if (ratio < 0.75) housingMultiplier = 0.75;
    else if (ratio < 1.00) housingMultiplier = 1.0;
    else housingMultiplier = 1.25;

    let everydayMultiplier;
    switch (card) {
        case 'blue': everydayMultiplier = 1; break;
        case 'obsidian': everydayMultiplier = 1.5; break;
        case 'palladium': everydayMultiplier = 2; break;
    }

    let monthlyHousingPoints, monthlyEverydayPoints, monthlyBiltCash, remainingBiltCash;

    if (option === 'housing') {
        monthlyHousingPoints = housingCost * housingMultiplier;
        if (housingMultiplier === 0 && housingCost > 0) {
            monthlyHousingPoints = 250;
        }
        monthlyEverydayPoints = everydaySpend * everydayMultiplier;
        monthlyBiltCash = 0;
        remainingBiltCash = 0;
    } else {
        monthlyBiltCash = everydaySpend * 0.04;
        const unlockablePoints = (monthlyBiltCash / 3) * 100;
        monthlyHousingPoints = Math.min(unlockablePoints, housingCost);
        const usedBiltCash = (monthlyHousingPoints / 100) * 3;
        remainingBiltCash = monthlyBiltCash - usedBiltCash;
        monthlyEverydayPoints = everydaySpend * everydayMultiplier;
    }

    const annualPoints = (monthlyHousingPoints + monthlyEverydayPoints) * 12;
    const pointValue = 0.015;

    let annualBenefits = 0;
    let annualFee = 0;
    switch (card) {
        case 'blue': annualFee = 0; break;
        case 'obsidian': annualFee = 95; annualBenefits = 100; break;
        case 'palladium': annualFee = 495; annualBenefits = 200 + 400; break;
    }

    const annualBiltCash = (monthlyBiltCash * 12) + remainingBiltCash * 12;
    const annualValue = (annualPoints * pointValue) + annualBiltCash + annualBenefits - annualFee;

    document.getElementById('monthlyHousingPoints').textContent = Math.round(monthlyHousingPoints).toLocaleString();
    document.getElementById('monthlyEverydayPoints').textContent = Math.round(monthlyEverydayPoints).toLocaleString();
    document.getElementById('monthlyBiltCash').textContent = '$' + monthlyBiltCash.toFixed(2);
    document.getElementById('remainingBiltCash').textContent = '$' + remainingBiltCash.toFixed(2);
    document.getElementById('annualValue').textContent = '$' + annualValue.toFixed(0);
    document.getElementById('spendRatio').textContent = ratioPercent + '%';
    document.getElementById('housingMultiplier').textContent = housingMultiplier + 'X';
    document.getElementById('annualPoints').textContent = Math.round(annualPoints).toLocaleString();

    updateComparison(housingCost, everydaySpend, option, housingMultiplier);
}

function updateComparison(housingCost, everydaySpend, option, housingMultiplier) {
    const cards = ['blue', 'obsidian', 'palladium'];
    const results = [];

    cards.forEach(card => {
        let everydayMultiplier;
        switch (card) {
            case 'blue': everydayMultiplier = 1; break;
            case 'obsidian': everydayMultiplier = 1.5; break;
            case 'palladium': everydayMultiplier = 2; break;
        }

        let monthlyHousingPoints, monthlyBiltCash, remainingBiltCash;

        if (option === 'housing') {
            monthlyHousingPoints = housingCost * housingMultiplier;
            if (housingMultiplier === 0 && housingCost > 0) monthlyHousingPoints = 250;
            monthlyBiltCash = 0;
            remainingBiltCash = 0;
        } else {
            monthlyBiltCash = everydaySpend * 0.04;
            const unlockablePoints = (monthlyBiltCash / 3) * 100;
            monthlyHousingPoints = Math.min(unlockablePoints, housingCost);
            const usedBiltCash = (monthlyHousingPoints / 100) * 3;
            remainingBiltCash = monthlyBiltCash - usedBiltCash;
        }

        const monthlyEverydayPoints = everydaySpend * everydayMultiplier;
        const annualPoints = (monthlyHousingPoints + monthlyEverydayPoints) * 12;

        let annualFee = 0, annualBenefits = 0;
        switch (card) {
            case 'blue': annualFee = 0; break;
            case 'obsidian': annualFee = 95; annualBenefits = 100; break;
            case 'palladium': annualFee = 495; annualBenefits = 600; break;
        }

        const annualBiltCash = remainingBiltCash * 12;
        const annualValue = (annualPoints * 0.015) + annualBiltCash + annualBenefits - annualFee;

        results.push({ card, value: annualValue, points: annualPoints, fee: annualFee });
    });

    const maxValue = Math.max(...results.map(r => r.value));

    const grid = document.getElementById('comparisonGrid');
    grid.innerHTML = results.map(r => `
        <div class="comparison-card card-${r.card} ${r.value === maxValue ? 'best' : ''}">
            <div class="card-name">${r.card.charAt(0).toUpperCase() + r.card.slice(1)}</div>
            <div class="card-value">$${r.value.toFixed(0)}</div>
            <div class="card-detail">${Math.round(r.points).toLocaleString()} pts/yr</div>
            <div class="card-fee-info">-$${r.fee} fee</div>
            ${r.value === maxValue ? '<span class="best-badge">BEST</span>' : ''}
        </div>
    `).join('');
}

function getCalculatorContext() {
    const housingCost = document.getElementById('housingCost').value;
    const everydaySpend = document.getElementById('everydaySpend').value;
    const card = document.querySelector('input[name="card"]:checked').value;
    const option = document.querySelector('input[name="option"]:checked').value;

    return {
        housing: parseFloat(housingCost) || 0,
        everydaySpend: parseFloat(everydaySpend) || 0,
        card: card,
        option: option
    };
}

window.calculator = {
    calculate: calculate,
    getContext: getCalculatorContext
};
