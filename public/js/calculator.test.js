/**
 * Bilt Card Calculator - Test Cases
 *
 * Run in browser console or Node.js to verify calculations
 *
 * Point value: 1 point = $0.015 (1.5 cents)
 */

// ============================================
// Pure calculation functions (extracted for testing)
// ============================================

function getHousingMultiplier(ratio) {
    if (ratio < 0.25) return 0;
    if (ratio < 0.50) return 0.5;
    if (ratio < 0.75) return 0.75;
    if (ratio < 1.00) return 1.0;
    return 1.25;
}

function getEverydayMultiplier(card) {
    switch (card) {
        case 'blue': return 1;
        case 'obsidian': return 1.5;
        case 'palladium': return 2;
    }
}

function getCardBenefitsAndFee(card) {
    switch (card) {
        case 'blue': return { benefits: 0, fee: 0 };
        case 'obsidian': return { benefits: 100, fee: 95 };
        case 'palladium': return { benefits: 600, fee: 495 };
    }
}

function calculateHousingOnly(housingCost, everydaySpend, card) {
    const ratio = housingCost > 0 ? (everydaySpend / housingCost) : 0;
    const housingMultiplier = getHousingMultiplier(ratio);
    const everydayMultiplier = getEverydayMultiplier(card);

    let monthlyHousingPoints = housingCost * housingMultiplier;
    if (housingMultiplier === 0 && housingCost > 0) {
        monthlyHousingPoints = 250; // minimum 250 points
    }
    const monthlyEverydayPoints = everydaySpend * everydayMultiplier;

    return {
        ratio,
        housingMultiplier,
        monthlyHousingPoints,
        monthlyEverydayPoints,
        monthlyBiltCash: 0,
        remainingBiltCash: 0
    };
}

function calculateFlexible(housingCost, everydaySpend, card) {
    const everydayMultiplier = getEverydayMultiplier(card);

    const monthlyBiltCash = everydaySpend * 0.04;
    const unlockablePoints = (monthlyBiltCash / 3) * 100;
    const monthlyHousingPoints = Math.min(unlockablePoints, housingCost);
    const usedBiltCash = (monthlyHousingPoints / 100) * 3;
    const remainingBiltCash = monthlyBiltCash - usedBiltCash;
    const monthlyEverydayPoints = everydaySpend * everydayMultiplier;

    return {
        monthlyBiltCash,
        unlockablePoints,
        monthlyHousingPoints,
        usedBiltCash,
        remainingBiltCash,
        monthlyEverydayPoints
    };
}

function calculateAnnualValue(monthlyHousingPoints, monthlyEverydayPoints, remainingBiltCash, card) {
    const { benefits, fee } = getCardBenefitsAndFee(card);
    const annualPoints = (monthlyHousingPoints + monthlyEverydayPoints) * 12;
    const pointsValue = Math.round(annualPoints * 0.015);
    const annualBiltCash = remainingBiltCash * 12;
    const annualValue = pointsValue + annualBiltCash + benefits - fee;

    return {
        annualPoints,
        pointsValue,
        annualBiltCash,
        benefits,
        fee,
        annualValue
    };
}

// ============================================
// Test Runner
// ============================================

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`✅ PASS: ${testName}`);
        return true;
    } else {
        console.error(`❌ FAIL: ${testName}`);
        if (details) console.error(`   Details: ${details}`);
        return false;
    }
}

function assertApprox(actual, expected, testName, tolerance = 0.01) {
    const diff = Math.abs(actual - expected);
    return assert(diff <= tolerance, testName, `Expected ${expected}, got ${actual}`);
}

// ============================================
// TEST 1: Housing Multiplier by Spend Ratio
// ============================================

function testHousingMultiplier() {
    console.log('\n=== TEST 1: Housing Multiplier ===');

    // Under 25% → 0X
    assert(getHousingMultiplier(0) === 0, 'Ratio 0% → 0X');
    assert(getHousingMultiplier(0.10) === 0, 'Ratio 10% → 0X');
    assert(getHousingMultiplier(0.24) === 0, 'Ratio 24% → 0X');

    // 25% ~ 50% → 0.5X
    assert(getHousingMultiplier(0.25) === 0.5, 'Ratio 25% → 0.5X');
    assert(getHousingMultiplier(0.40) === 0.5, 'Ratio 40% → 0.5X');
    assert(getHousingMultiplier(0.49) === 0.5, 'Ratio 49% → 0.5X');

    // 50% ~ 75% → 0.75X
    assert(getHousingMultiplier(0.50) === 0.75, 'Ratio 50% → 0.75X');
    assert(getHousingMultiplier(0.60) === 0.75, 'Ratio 60% → 0.75X');
    assert(getHousingMultiplier(0.74) === 0.75, 'Ratio 74% → 0.75X');

    // 75% ~ 100% → 1.0X
    assert(getHousingMultiplier(0.75) === 1.0, 'Ratio 75% → 1.0X');
    assert(getHousingMultiplier(0.90) === 1.0, 'Ratio 90% → 1.0X');
    assert(getHousingMultiplier(0.99) === 1.0, 'Ratio 99% → 1.0X');

    // 100%+ → 1.25X
    assert(getHousingMultiplier(1.0) === 1.25, 'Ratio 100% → 1.25X');
    assert(getHousingMultiplier(1.5) === 1.25, 'Ratio 150% → 1.25X');
    assert(getHousingMultiplier(2.0) === 1.25, 'Ratio 200% → 1.25X');
}

// ============================================
// TEST 2: Everyday Multiplier by Card
// ============================================

function testEverydayMultiplier() {
    console.log('\n=== TEST 2: Everyday Multiplier ===');

    assert(getEverydayMultiplier('blue') === 1, 'Blue → 1X');
    assert(getEverydayMultiplier('obsidian') === 1.5, 'Obsidian → 1.5X (avg)');
    assert(getEverydayMultiplier('palladium') === 2, 'Palladium → 2X');
}

// ============================================
// TEST 3: Housing-only Option Calculation
// ============================================

function testHousingOnlyOption() {
    console.log('\n=== TEST 3: Housing-only Option ===');

    // Case: Housing $2500, Everyday $500 (20% ratio → 0X, min 250 pts)
    let result = calculateHousingOnly(2500, 500, 'palladium');
    assertApprox(result.ratio, 0.2, 'Ratio = 500/2500 = 0.2 (20%)');
    assert(result.housingMultiplier === 0, 'Multiplier = 0X (under 25%)');
    assert(result.monthlyHousingPoints === 250, 'Housing Points = 250 (minimum)');
    assert(result.monthlyEverydayPoints === 1000, 'Everyday Points = 500 × 2X = 1000');

    // Case: Housing $2000, Everyday $1000 (50% ratio → 0.75X)
    result = calculateHousingOnly(2000, 1000, 'blue');
    assertApprox(result.ratio, 0.5, 'Ratio = 1000/2000 = 0.5 (50%)');
    assert(result.housingMultiplier === 0.75, 'Multiplier = 0.75X');
    assert(result.monthlyHousingPoints === 1500, 'Housing Points = 2000 × 0.75 = 1500');
    assert(result.monthlyEverydayPoints === 1000, 'Everyday Points = 1000 × 1X = 1000');

    // Case: Housing $1500, Everyday $1500 (100% ratio → 1.25X)
    result = calculateHousingOnly(1500, 1500, 'obsidian');
    assertApprox(result.ratio, 1.0, 'Ratio = 1500/1500 = 1.0 (100%)');
    assert(result.housingMultiplier === 1.25, 'Multiplier = 1.25X');
    assert(result.monthlyHousingPoints === 1875, 'Housing Points = 1500 × 1.25 = 1875');
    assert(result.monthlyEverydayPoints === 2250, 'Everyday Points = 1500 × 1.5X = 2250');
}

// ============================================
// TEST 4: Flexible Option Calculation
// ============================================

function testFlexibleOption() {
    console.log('\n=== TEST 4: Flexible Option ===');

    // Case: Housing $2500, Everyday $500
    // Bilt Cash = $500 × 4% = $20
    // Unlockable = ($20 / $3) × 100 = 666.67 points
    // Housing Points = min(666.67, 2500) = 666.67
    // Used Cash = (666.67 / 100) × $3 = $20
    // Remaining Cash = $20 - $20 = $0

    let result = calculateFlexible(2500, 500, 'palladium');
    assertApprox(result.monthlyBiltCash, 20, 'Bilt Cash = $500 × 4% = $20');
    assertApprox(result.unlockablePoints, 666.67, 'Unlockable = ($20/$3) × 100 = 666.67 pts', 0.1);
    assertApprox(result.monthlyHousingPoints, 666.67, 'Housing Points = min(666.67, 2500) = 666.67', 0.1);
    assertApprox(result.usedBiltCash, 20, 'Used Cash = (666.67/100) × $3 = $20');
    assertApprox(result.remainingBiltCash, 0, 'Remaining Cash = $20 - $20 = $0');
    assertApprox(result.monthlyEverydayPoints, 1000, 'Everyday Points = 500 × 2X = 1000');

    // Case: Housing $500, Everyday $2000
    // Bilt Cash = $2000 × 4% = $80
    // Unlockable = ($80 / $3) × 100 = 2666.67 points
    // Housing Points = min(2666.67, 500) = 500 (capped by housing)
    // Used Cash = (500 / 100) × $3 = $15
    // Remaining Cash = $80 - $15 = $65

    result = calculateFlexible(500, 2000, 'blue');
    assertApprox(result.monthlyBiltCash, 80, 'Bilt Cash = $2000 × 4% = $80');
    assertApprox(result.unlockablePoints, 2666.67, 'Unlockable = ($80/$3) × 100 = 2666.67 pts', 0.1);
    assertApprox(result.monthlyHousingPoints, 500, 'Housing Points = min(2666.67, 500) = 500 (capped)');
    assertApprox(result.usedBiltCash, 15, 'Used Cash = (500/100) × $3 = $15');
    assertApprox(result.remainingBiltCash, 65, 'Remaining Cash = $80 - $15 = $65');
    assertApprox(result.monthlyEverydayPoints, 2000, 'Everyday Points = 2000 × 1X = 2000');
}

// ============================================
// TEST 5: Annual Value Calculation
// ============================================

function testAnnualValue() {
    console.log('\n=== TEST 5: Annual Value Calculation ===');

    // Case: Blue card, Housing-only
    // Monthly: 250 housing + 1000 everyday = 1250 pts
    // Annual: 1250 × 12 = 15,000 pts
    // Points Value: 15,000 × $0.015 = $225
    // No Bilt Cash, no benefits, no fee
    // Total: $225

    let result = calculateAnnualValue(250, 1000, 0, 'blue');
    assert(result.annualPoints === 15000, 'Annual Points = (250+1000) × 12 = 15,000');
    assert(result.pointsValue === 225, 'Points Value = 15,000 × $0.015 = $225');
    assert(result.benefits === 0, 'Blue Benefits = $0');
    assert(result.fee === 0, 'Blue Fee = $0');
    assert(result.annualValue === 225, 'Annual Value = $225 + $0 + $0 - $0 = $225');

    // Case: Obsidian card
    // Same points, but with benefits and fee
    // Total: $225 + $0 + $100 - $95 = $230

    result = calculateAnnualValue(250, 1000, 0, 'obsidian');
    assert(result.benefits === 100, 'Obsidian Benefits = $100');
    assert(result.fee === 95, 'Obsidian Fee = $95');
    assert(result.annualValue === 230, 'Annual Value = $225 + $0 + $100 - $95 = $230');

    // Case: Palladium card
    // Total: $225 + $0 + $600 - $495 = $330

    result = calculateAnnualValue(250, 1000, 0, 'palladium');
    assert(result.benefits === 600, 'Palladium Benefits = $600');
    assert(result.fee === 495, 'Palladium Fee = $495');
    assert(result.annualValue === 330, 'Annual Value = $225 + $0 + $600 - $495 = $330');

    // Case: With remaining Bilt Cash ($65/month)
    // Annual Bilt Cash = $65 × 12 = $780
    // Blue: $225 + $780 + $0 - $0 = $1005

    result = calculateAnnualValue(250, 1000, 65, 'blue');
    assert(result.annualBiltCash === 780, 'Annual Bilt Cash = $65 × 12 = $780');
    assert(result.annualValue === 1005, 'Annual Value = $225 + $780 + $0 - $0 = $1005');
}

// ============================================
// TEST 6: Full Scenario - User's Example
// ============================================

function testUserScenario() {
    console.log('\n=== TEST 6: User Scenario (Housing $2500, Everyday $500, Flexible) ===');

    // Housing: $2500, Everyday: $500
    // Flexible option selected

    const housingCost = 2500;
    const everydaySpend = 500;

    console.log('\n--- Palladium Card ---');
    let flex = calculateFlexible(housingCost, everydaySpend, 'palladium');
    console.log(`Bilt Cash: $${flex.monthlyBiltCash.toFixed(2)}`);
    console.log(`Unlockable Points: ${flex.unlockablePoints.toFixed(2)}`);
    console.log(`Monthly Housing Points: ${flex.monthlyHousingPoints.toFixed(2)}`);
    console.log(`Monthly Everyday Points: ${flex.monthlyEverydayPoints}`);
    console.log(`Remaining Cash: $${flex.remainingBiltCash.toFixed(2)}`);

    let annual = calculateAnnualValue(
        flex.monthlyHousingPoints,
        flex.monthlyEverydayPoints,
        flex.remainingBiltCash,
        'palladium'
    );
    console.log(`\nAnnual Points: ${annual.annualPoints.toFixed(0)}`);
    console.log(`Points Value: $${annual.pointsValue}`);
    console.log(`Annual Bilt Cash: $${annual.annualBiltCash.toFixed(2)}`);
    console.log(`Benefits: +$${annual.benefits}`);
    console.log(`Fee: -$${annual.fee}`);
    console.log(`\n>>> Annual Value: $${annual.annualValue.toFixed(0)}`);
    console.log(`>>> Breakdown: $${annual.pointsValue} + $${annual.benefits} - $${annual.fee} = $${annual.annualValue.toFixed(0)}`);

    // Verify the calculation matches what user saw
    // 20,000 pts/yr → $300
    // + $600 benefits - $495 fee = $405
    assertApprox(annual.annualPoints, 20000, 'Annual Points ≈ 20,000', 10);
    assertApprox(annual.pointsValue, 300, 'Points Value ≈ $300', 5);
    assertApprox(annual.annualValue, 405, 'Annual Value ≈ $405', 5);
}

// ============================================
// TEST 7: Card Comparison (Best Selection)
// ============================================

function testCardComparison() {
    console.log('\n=== TEST 7: Card Comparison ===');

    const housingCost = 2500;
    const everydaySpend = 500;

    const cards = ['blue', 'obsidian', 'palladium'];
    const results = [];

    cards.forEach(card => {
        const flex = calculateFlexible(housingCost, everydaySpend, card);
        const annual = calculateAnnualValue(
            flex.monthlyHousingPoints,
            flex.monthlyEverydayPoints,
            flex.remainingBiltCash,
            card
        );
        results.push({
            card,
            points: annual.annualPoints,
            pointsValue: annual.pointsValue,
            benefits: annual.benefits,
            fee: annual.fee,
            value: annual.annualValue
        });
    });

    console.log('\n--- Comparison Results ---');
    results.forEach(r => {
        console.log(`${r.card}: ${r.points} pts ($${r.pointsValue}) + $${r.benefits} - $${r.fee} = $${r.value}`);
    });

    const maxValue = Math.max(...results.map(r => r.value));
    const bestCard = results.find(r => r.value === maxValue).card;

    console.log(`\nBest Card: ${bestCard} with $${maxValue}`);

    // Verify best card selection
    assert(bestCard === 'palladium', 'Best card should be Palladium');
}

// ============================================
// RUN ALL TESTS
// ============================================

function runAllTests() {
    console.log('🧪 Bilt Card Calculator - Test Suite\n');
    console.log('Point Value: 1 point = $0.015 (1.5 cents)');
    console.log('========================================');

    testHousingMultiplier();
    testEverydayMultiplier();
    testHousingOnlyOption();
    testFlexibleOption();
    testAnnualValue();
    testUserScenario();
    testCardComparison();

    console.log('\n========================================');
    console.log('🏁 All tests completed!');
}

// Run tests
runAllTests();
