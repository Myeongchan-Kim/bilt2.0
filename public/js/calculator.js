// Calculator module

function calculate() {
    const housingCost = parseFloat(document.getElementById('housingCost').value) || 0;
    const everydaySpend = parseFloat(document.getElementById('everydaySpend').value) || 0;
    const card = document.querySelector('input[name="card"]:checked').value;
    const option = document.querySelector('input[name="option"]:checked').value;
    const hotelInput = document.querySelector('input[name="hotelValue"]:checked');
    const userHotelValue = hotelInput ? parseInt(hotelInput.value) : 400;

    // Ratio calculation
    const ratio = housingCost > 0 ? (everydaySpend / housingCost) : 0;
    const ratioPercent = (ratio * 100).toFixed(1);

    // Housing multiplier (for Housing-only option)
    let housingMultiplier;
    if (ratio < 0.25) housingMultiplier = 0;
    else if (ratio < 0.50) housingMultiplier = 0.5;
    else if (ratio < 0.75) housingMultiplier = 0.75;
    else if (ratio < 1.00) housingMultiplier = 1.0;
    else housingMultiplier = 1.25;

    // Everyday multiplier by card
    let everydayMultiplier;
    switch (card) {
        case 'blue': everydayMultiplier = 1; break;
        case 'obsidian':
            const obsidianSlider = document.getElementById('obsidianMultiplier');
            everydayMultiplier = obsidianSlider ? parseFloat(obsidianSlider.value) : 1.5;
            break;
        case 'palladium': everydayMultiplier = 2; break;
    }

    // Card benefits and fees (with user's hotel value)
    // Max hotel credit: Blue=$0, Obsidian=$100, Palladium=$400
    // Annual cash bonus: Blue=$0, Obsidian=$0, Palladium=$200
    let annualBenefits = 0;
    let annualFee = 0;
    let benefitsDetail = '';
    let feeDetail = '';
    let maxHotelCredit = 0;
    let actualHotelCredit = 0;
    let annualCashBonus = 0;

    switch (card) {
        case 'blue':
            annualFee = 0;
            maxHotelCredit = 0;
            annualCashBonus = 0;
            feeDetail = 'Blue (Free)';
            break;
        case 'obsidian':
            annualFee = 95;
            maxHotelCredit = 100;
            annualCashBonus = 0;
            feeDetail = 'Obsidian';
            break;
        case 'palladium':
            annualFee = 495;
            maxHotelCredit = 400;
            annualCashBonus = 200;
            feeDetail = 'Palladium';
            break;
    }

    // Apply user's hotel value (capped by card's max)
    actualHotelCredit = Math.min(userHotelValue, maxHotelCredit);
    annualBenefits = actualHotelCredit + annualCashBonus;

    // Build benefits detail string
    if (annualBenefits === 0) {
        benefitsDetail = 'None';
    } else {
        let parts = [];
        if (actualHotelCredit > 0) parts.push(`Hotel $${actualHotelCredit}`);
        if (annualCashBonus > 0) parts.push(`Cash $${annualCashBonus}`);
        benefitsDetail = parts.join(' + ');
    }

    // Calculate based on option
    let monthlyHousingPoints, monthlyEverydayPoints, monthlyBiltCash, usedBiltCash, remainingBiltCash, unlockablePoints;

    monthlyEverydayPoints = everydaySpend * everydayMultiplier;

    if (option === 'housing') {
        // Housing-only option
        monthlyHousingPoints = housingCost * housingMultiplier;
        if (housingMultiplier === 0 && housingCost > 0) {
            monthlyHousingPoints = 250; // minimum
        }
        monthlyBiltCash = 0;
        usedBiltCash = 0;
        remainingBiltCash = 0;
        unlockablePoints = 0;

        // Hide Bilt Cash step
        document.getElementById('stepBiltCash').style.display = 'none';
    } else {
        // Flexible option
        monthlyBiltCash = everydaySpend * 0.04;
        unlockablePoints = (monthlyBiltCash / 3) * 100;
        monthlyHousingPoints = Math.min(unlockablePoints, housingCost);
        usedBiltCash = (monthlyHousingPoints / 100) * 3;
        remainingBiltCash = monthlyBiltCash - usedBiltCash;

        // Show Bilt Cash step
        document.getElementById('stepBiltCash').style.display = 'block';
    }

    // Annual calculations
    const annualPoints = (monthlyHousingPoints + monthlyEverydayPoints) * 12;
    const annualPointsValue = Math.round(annualPoints * 0.015);
    const annualRemainingCash = remainingBiltCash * 12;
    const annualValue = annualPointsValue + annualRemainingCash + annualBenefits - annualFee;

    // ===== UPDATE UI =====

    // STEP 1: Monthly Points
    document.getElementById('everydayFormula').textContent = `$${everydaySpend.toLocaleString()} × ${everydayMultiplier}X`;
    document.getElementById('monthlyEverydayPoints').textContent = Math.round(monthlyEverydayPoints).toLocaleString();

    const housingRow = document.getElementById('housingRowHousingOnly');
    if (option === 'housing') {
        housingRow.style.display = 'grid';
        if (housingMultiplier === 0 && housingCost > 0) {
            document.getElementById('housingFormulaHousingOnly').textContent = `$${housingCost.toLocaleString()} × 0X (min 250)`;
        } else {
            document.getElementById('housingFormulaHousingOnly').textContent = `$${housingCost.toLocaleString()} × ${housingMultiplier}X`;
        }
        document.getElementById('monthlyHousingPointsDisplay').textContent = Math.round(monthlyHousingPoints).toLocaleString();
    } else {
        // In Flexible mode, housing points come from Bilt Cash
        housingRow.style.display = 'grid';
        document.getElementById('housingFormulaHousingOnly').textContent = `via Bilt Cash (Step 2)`;
        document.getElementById('monthlyHousingPointsDisplay').textContent = Math.round(monthlyHousingPoints).toLocaleString();
    }

    // STEP 2: Bilt Cash (Flexible only)
    if (option === 'flexible') {
        document.getElementById('cashEarnedFormula').textContent = `$${everydaySpend.toLocaleString()} × 4%`;
        document.getElementById('monthlyBiltCash').textContent = `$${monthlyBiltCash.toFixed(2)}`;

        document.getElementById('unlockFormula').textContent = `$${monthlyBiltCash.toFixed(0)} ÷ $3 × 100`;
        document.getElementById('unlockablePoints').textContent = `${Math.round(unlockablePoints).toLocaleString()} pts`;

        document.getElementById('cashUsedFormula').textContent = `${Math.round(monthlyHousingPoints)} ÷ 100 × $3`;
        document.getElementById('usedBiltCash').textContent = `-$${usedBiltCash.toFixed(2)}`;

        document.getElementById('remainingFormula').textContent = `$${monthlyBiltCash.toFixed(0)} - $${usedBiltCash.toFixed(0)}`;
        document.getElementById('remainingBiltCash').textContent = `$${remainingBiltCash.toFixed(2)}`;
    }

    // STEP 3: Annual Totals
    document.getElementById('annualPointsFormula').textContent =
        `(${Math.round(monthlyEverydayPoints).toLocaleString()} + ${Math.round(monthlyHousingPoints).toLocaleString()}) × 12`;
    document.getElementById('annualPoints').textContent = Math.round(annualPoints).toLocaleString();

    document.getElementById('pointsValueFormula').textContent = `${Math.round(annualPoints).toLocaleString()} × $0.015`;
    document.getElementById('annualPointsValue').textContent = `$${annualPointsValue}`;

    const annualCashRow = document.getElementById('annualCashRow');
    if (option === 'flexible' && remainingBiltCash > 0) {
        annualCashRow.style.display = 'grid';
        document.getElementById('annualCashFormula').textContent = `$${remainingBiltCash.toFixed(0)} × 12`;
        document.getElementById('annualRemainingCash').textContent = `$${Math.round(annualRemainingCash)}`;
    } else {
        annualCashRow.style.display = 'none';
    }

    // STEP 4: Final Value
    document.getElementById('finalPointsValue').textContent = `$${annualPointsValue}`;

    const finalCashRow = document.getElementById('finalCashRow');
    if (annualRemainingCash > 0) {
        finalCashRow.style.display = 'grid';
        document.getElementById('finalCashValue').textContent = `+$${Math.round(annualRemainingCash)}`;
    } else {
        finalCashRow.style.display = 'none';
    }

    document.getElementById('benefitsDetail').textContent = benefitsDetail;
    document.getElementById('annualBenefits').textContent = annualBenefits > 0 ? `+$${annualBenefits}` : '$0';

    document.getElementById('feeDetail').textContent = feeDetail;
    document.getElementById('annualFee').textContent = annualFee > 0 ? `−$${annualFee}` : '$0';

    // Build total formula
    let totalFormula = `$${annualPointsValue}`;
    if (annualRemainingCash > 0) totalFormula += ` + $${Math.round(annualRemainingCash)}`;
    if (annualBenefits > 0) totalFormula += ` + $${annualBenefits}`;
    if (annualFee > 0) totalFormula += ` − $${annualFee}`;
    document.getElementById('totalFormula').textContent = totalFormula;
    document.getElementById('annualValue').textContent = `$${annualValue.toFixed(0)}`;

    // Welcome Bonus calculation
    let bonusCash = 0;
    let bonusPoints = 0;
    let bonusCashDetail = '';
    switch (card) {
        case 'blue':
            bonusCash = 100;
            bonusPoints = 0;
            bonusCashDetail = 'Blue signup';
            break;
        case 'obsidian':
            bonusCash = 200;
            bonusPoints = 0;
            bonusCashDetail = 'Obsidian signup';
            break;
        case 'palladium':
            bonusCash = 300;
            bonusPoints = 50000; // requires $4k spend in 3 months
            bonusCashDetail = 'Palladium signup';
            break;
    }

    const bonusPointsValue = Math.round(bonusPoints * 0.015);
    const totalWelcomeBonus = bonusCash + bonusPointsValue;
    const firstYearValue = annualValue + totalWelcomeBonus;

    // Update Welcome Bonus UI
    document.getElementById('bonusCashDetail').textContent = bonusCashDetail;
    document.getElementById('bonusCash').textContent = `+$${bonusCash}`;

    const bonusPointsRow = document.getElementById('bonusPointsRow');
    if (bonusPoints > 0) {
        bonusPointsRow.style.display = 'grid';
        document.getElementById('bonusPointsDetail').textContent = `${bonusPoints.toLocaleString()} pts × $0.015`;
        document.getElementById('bonusPointsValue').textContent = `+$${bonusPointsValue}`;
    } else {
        bonusPointsRow.style.display = 'none';
    }

    document.getElementById('totalWelcomeBonus').textContent = `+$${totalWelcomeBonus}`;

    // Year comparison
    document.getElementById('firstYearValue').textContent = `$${firstYearValue.toFixed(0)}`;
    document.getElementById('firstYearDetail').textContent = `$${annualValue.toFixed(0)} + $${totalWelcomeBonus} bonus`;
    document.getElementById('year2Value').textContent = `$${annualValue.toFixed(0)}`;

    // Reference info
    document.getElementById('spendRatio').textContent = ratioPercent + '%';
    document.getElementById('housingMultiplier').textContent = housingMultiplier + 'X';

    // Update comparison
    updateComparison(housingCost, everydaySpend, option, housingMultiplier, userHotelValue);
}

function updateComparison(housingCost, everydaySpend, option, housingMultiplier, userHotelValue) {
    const cards = ['blue', 'obsidian', 'palladium'];
    const results = [];

    // Get custom Obsidian multiplier
    const obsidianSlider = document.getElementById('obsidianMultiplier');
    const customObsidianMult = obsidianSlider ? parseFloat(obsidianSlider.value) : 1.5;

    cards.forEach(card => {
        let everydayMultiplier;
        switch (card) {
            case 'blue': everydayMultiplier = 1; break;
            case 'obsidian': everydayMultiplier = customObsidianMult; break;
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

        // Calculate benefits with user's hotel value
        let annualFee = 0, maxHotelCredit = 0, annualCashBonus = 0;
        switch (card) {
            case 'blue':
                annualFee = 0;
                maxHotelCredit = 0;
                annualCashBonus = 0;
                break;
            case 'obsidian':
                annualFee = 95;
                maxHotelCredit = 100;
                annualCashBonus = 0;
                break;
            case 'palladium':
                annualFee = 495;
                maxHotelCredit = 400;
                annualCashBonus = 200;
                break;
        }

        const actualHotelCredit = Math.min(userHotelValue, maxHotelCredit);
        const annualBenefits = actualHotelCredit + annualCashBonus;

        const annualBiltCash = remainingBiltCash * 12;
        const pointsValue = Math.round(annualPoints * 0.015);
        const annualValue = pointsValue + annualBiltCash + annualBenefits - annualFee;

        // Welcome bonus calculation
        let bonusCash = 0, bonusPoints = 0;
        switch (card) {
            case 'blue': bonusCash = 100; bonusPoints = 0; break;
            case 'obsidian': bonusCash = 200; bonusPoints = 0; break;
            case 'palladium': bonusCash = 300; bonusPoints = 50000; break;
        }
        const bonusPointsValue = Math.round(bonusPoints * 0.015);
        const totalWelcomeBonus = bonusCash + bonusPointsValue;
        const firstYearValue = annualValue + totalWelcomeBonus;

        results.push({
            card,
            value: annualValue,
            firstYearValue: firstYearValue,
            welcomeBonus: totalWelcomeBonus,
            points: annualPoints,
            pointsValue: pointsValue,
            benefits: annualBenefits,
            fee: annualFee
        });
    });

    const maxValue = Math.max(...results.map(r => r.value));
    const maxFirstYear = Math.max(...results.map(r => r.firstYearValue));

    const grid = document.getElementById('comparisonGrid');
    grid.innerHTML = results.map(r => {
        // Build breakdown string
        let breakdown = `$${r.pointsValue}`;
        if (r.benefits > 0) breakdown += ` + $${r.benefits}`;
        if (r.fee > 0) breakdown += ` − $${r.fee}`;

        return `
        <div class="comparison-card card-${r.card} ${r.value === maxValue ? 'best' : ''}">
            <div class="card-name">${r.card.charAt(0).toUpperCase() + r.card.slice(1)}</div>
            <div class="card-value">$${r.value.toFixed(0)}<span class="card-value-label">/yr</span></div>
            <div class="card-detail">${Math.round(r.points).toLocaleString()} pts (≈$${r.pointsValue})</div>
            <div class="card-breakdown">${breakdown}</div>
            <div class="card-first-year ${r.firstYearValue === maxFirstYear ? 'best-first' : ''}">
                <span class="first-year-label">1st yr:</span> $${r.firstYearValue.toFixed(0)}
                <span class="bonus-detail">(+$${r.welcomeBonus})</span>
            </div>
            ${r.value === maxValue ? '<span class="best-badge">BEST</span>' : ''}
        </div>
    `}).join('');
}

function getCalculatorContext() {
    const housingCost = parseFloat(document.getElementById('housingCost').value) || 0;
    const everydaySpend = parseFloat(document.getElementById('everydaySpend').value) || 0;
    const card = document.querySelector('input[name="card"]:checked').value;
    const option = document.querySelector('input[name="option"]:checked').value;
    const hotelInput = document.querySelector('input[name="hotelValue"]:checked');
    const hotelValue = hotelInput ? parseInt(hotelInput.value) : 100;

    // Calculate key metrics
    const ratio = housingCost > 0 ? (everydaySpend / housingCost) : 0;
    const ratioPercent = (ratio * 100).toFixed(1);

    let housingMultiplier;
    if (ratio < 0.25) housingMultiplier = 0;
    else if (ratio < 0.50) housingMultiplier = 0.5;
    else if (ratio < 0.75) housingMultiplier = 0.75;
    else if (ratio < 1.00) housingMultiplier = 1.0;
    else housingMultiplier = 1.25;

    // Get displayed results
    const monthlyHousingPts = document.getElementById('monthlyHousingPoints')?.textContent || '0';
    const monthlyEverydayPts = document.getElementById('monthlyEverydayPoints')?.textContent || '0';
    const annualPts = document.getElementById('annualPoints')?.textContent || '0';
    const annualValue = document.getElementById('annualValue')?.textContent || '$0';

    return {
        housing: housingCost,
        everydaySpend: everydaySpend,
        card: card,
        option: option,
        hotelValue: hotelValue,
        spendRatio: ratioPercent + '%',
        housingMultiplier: housingMultiplier + 'X',
        monthlyHousingPoints: monthlyHousingPts,
        monthlyEverydayPoints: monthlyEverydayPts,
        annualPoints: annualPts,
        annualValue: annualValue
    };
}

window.calculator = {
    calculate: calculate,
    getContext: getCalculatorContext
};
