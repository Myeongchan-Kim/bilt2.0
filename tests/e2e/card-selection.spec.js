// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Card selection functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for calculator to initialize
    await page.waitForSelector('#annualValue');
  });

  test('should select Blue card and show $0 fee', async ({ page }) => {
    // Select Blue card using evaluate to handle hidden radio inputs
    await page.evaluate(() => {
      const radio = document.getElementById('cardBlue');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Wait for calculation update
    await page.waitForTimeout(300);

    // Fee should show $0
    const annualFee = page.locator('#annualFee');
    await expect(annualFee).toContainText('$0');

    // Fee detail should show Blue
    const feeDetail = page.locator('#feeDetail');
    await expect(feeDetail).toContainText('Blue');

    // Benefits should be $0
    const annualBenefits = page.locator('#annualBenefits');
    await expect(annualBenefits).toContainText('$0');
  });

  test('should select Obsidian card and show $95 fee', async ({ page }) => {
    // Select Obsidian card using evaluate to handle hidden radio inputs
    await page.evaluate(() => {
      const radio = document.getElementById('cardObsidian');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Wait for calculation update
    await page.waitForTimeout(300);

    // Fee should show $95
    const annualFee = page.locator('#annualFee');
    await expect(annualFee).toContainText('95');

    // Fee detail should show Obsidian
    const feeDetail = page.locator('#feeDetail');
    await expect(feeDetail).toContainText('Obsidian');
  });

  test('should select Palladium card and show $495 fee with benefits', async ({ page }) => {
    // Palladium is default, but let's verify
    const palladiumRadio = page.locator('#cardPalladium');
    await expect(palladiumRadio).toBeChecked();

    // Fee should show $495
    const annualFee = page.locator('#annualFee');
    await expect(annualFee).toContainText('495');

    // Fee detail should show Palladium
    const feeDetail = page.locator('#feeDetail');
    await expect(feeDetail).toContainText('Palladium');

    // Benefits should include both hotel and cash
    const benefitsDetail = page.locator('#benefitsDetail');
    const detailText = await benefitsDetail.textContent();
    expect(detailText).toContain('200'); // Cash benefit
    expect(detailText).toContain('400'); // Hotel benefit (default)
  });

  test('should update comparison grid when card changes', async ({ page }) => {
    const comparisonGrid = page.locator('#comparisonGrid');

    // Comparison grid should have content
    await expect(comparisonGrid).not.toBeEmpty();

    // Change to Blue card using evaluate
    await page.evaluate(() => {
      const radio = document.getElementById('cardBlue');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // Comparison should still be populated
    await expect(comparisonGrid).not.toBeEmpty();
  });

  test('should calculate different everyday points per card', async ({ page }) => {
    const everydayFormula = page.locator('#everydayFormula');
    const monthlyEverydayPoints = page.locator('#monthlyEverydayPoints');

    // Palladium (default): 2X multiplier
    await expect(everydayFormula).toContainText('2X');
    await expect(monthlyEverydayPoints).toContainText('1,000');

    // Switch to Obsidian: 2X multiplier (default slider value)
    await page.evaluate(() => {
      const radio = document.getElementById('cardObsidian');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await expect(everydayFormula).toContainText('2X');
    await expect(monthlyEverydayPoints).toContainText('1,000');

    // Switch to Blue: 1X multiplier
    await page.evaluate(() => {
      const radio = document.getElementById('cardBlue');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await expect(everydayFormula).toContainText('1X');
    await expect(monthlyEverydayPoints).toContainText('500');
  });

  test('should show correct welcome bonus for each card', async ({ page }) => {
    const bonusCash = page.locator('#bonusCash');
    const bonusPointsValue = page.locator('#bonusPointsValue');

    // Palladium (default): $300 cash + 50,000 points bonus
    await expect(bonusCash).toContainText('300');
    await expect(bonusPointsValue).toContainText('750'); // 50,000 * 0.015

    // Switch to Obsidian: $200 signup bonus
    await page.evaluate(() => {
      const radio = document.getElementById('cardObsidian');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await expect(bonusCash).toContainText('200');

    // Switch to Blue: $100 signup bonus
    await page.evaluate(() => {
      const radio = document.getElementById('cardBlue');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    await expect(bonusCash).toContainText('100');
  });

  test('should update first year value when card changes', async ({ page }) => {
    const firstYearValue = page.locator('#firstYearValue');

    // Get Palladium first year value (wait for it to be stable)
    await page.waitForTimeout(200);
    const palladiumText = await firstYearValue.textContent();
    const palladiumVal = parseInt(palladiumText?.replace(/[$,]/g, '') || '0');

    // Switch to Blue using evaluate
    await page.evaluate(() => {
      const radio = document.getElementById('cardBlue');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    const blueText = await firstYearValue.textContent();
    const blueVal = parseInt(blueText?.replace(/[$,]/g, '') || '0');

    // Palladium should have higher first year value due to larger bonus
    expect(palladiumVal).toBeGreaterThan(blueVal);
  });
});
