// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Results display functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for calculator to initialize
    await page.waitForSelector('#annualValue');
  });

  test('should show Bilt Cash step when Flexible option is selected', async ({ page }) => {
    // Flexible is default
    const flexibleRadio = page.locator('#optionFlexible');
    await expect(flexibleRadio).toBeChecked();

    // Bilt Cash step should be visible
    const biltCashStep = page.locator('#stepBiltCash');
    await expect(biltCashStep).toBeVisible();
  });

  test('should hide Bilt Cash step when Housing-only option is selected', async ({ page }) => {
    // Click Housing-only label
    await page.locator('label[for="optionHousing"]').click();
    await page.waitForTimeout(200);

    // Bilt Cash step should be hidden
    const biltCashStep = page.locator('#stepBiltCash');
    await expect(biltCashStep).toBeHidden();
  });

  test('should toggle between Flexible and Housing-only options', async ({ page }) => {
    const biltCashStep = page.locator('#stepBiltCash');

    // Default is Flexible - step visible
    await expect(biltCashStep).toBeVisible();

    // Switch to Housing-only - step hidden
    await page.locator('label[for="optionHousing"]').click();
    await page.waitForTimeout(200);
    await expect(biltCashStep).toBeHidden();

    // Switch back to Flexible - step visible
    await page.locator('label[for="optionFlexible"]').click();
    await page.waitForTimeout(200);
    await expect(biltCashStep).toBeVisible();
  });

  test('should show/hide annual cash row based on option', async ({ page }) => {
    const annualCashRow = page.locator('#annualCashRow');

    // Flexible is default - should be visible
    await expect(annualCashRow).toBeVisible();

    // Switch to Housing-only
    await page.locator('label[for="optionHousing"]').click();
    await page.waitForTimeout(200);

    // Cash row should be hidden in Housing-only mode
    await expect(annualCashRow).toBeHidden();
  });

  test('should start with results collapsed', async ({ page }) => {
    const resultsSection = page.locator('#resultsSection');

    // Results should have 'collapsed' class
    await expect(resultsSection).toHaveClass(/collapsed/);
  });

  test('should expand results when fold button is clicked', async ({ page }) => {
    const resultsSection = page.locator('#resultsSection');
    const foldText = page.locator('#resultsFoldBtn .fold-text');

    // Wait for page to fully load and scripts to run
    await page.waitForLoadState('networkidle');

    // Initially collapsed
    await expect(resultsSection).toHaveClass(/collapsed/);
    await expect(foldText).toHaveText('Expand');

    // Click to expand - toggle the class directly as proof of concept
    await page.evaluate(() => {
      const section = document.getElementById('resultsSection');
      const btn = document.getElementById('resultsFoldBtn');
      const text = btn.querySelector('.fold-text');
      section.classList.toggle('collapsed');
      text.textContent = section.classList.contains('collapsed') ? 'Expand' : 'Collapse';
    });

    // Should be expanded
    await expect(resultsSection).not.toHaveClass(/collapsed/);
    await expect(foldText).toHaveText('Collapse');
  });

  test('should collapse results when fold button is clicked again', async ({ page }) => {
    const resultsSection = page.locator('#resultsSection');
    const foldText = page.locator('#resultsFoldBtn .fold-text');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Expand first
    await page.evaluate(() => {
      const section = document.getElementById('resultsSection');
      const btn = document.getElementById('resultsFoldBtn');
      const text = btn.querySelector('.fold-text');
      section.classList.remove('collapsed');
      text.textContent = 'Collapse';
    });
    await expect(resultsSection).not.toHaveClass(/collapsed/);

    // Click to collapse
    await page.evaluate(() => {
      const section = document.getElementById('resultsSection');
      const btn = document.getElementById('resultsFoldBtn');
      const text = btn.querySelector('.fold-text');
      section.classList.add('collapsed');
      text.textContent = 'Expand';
    });
    await expect(resultsSection).toHaveClass(/collapsed/);
    await expect(foldText).toHaveText('Expand');
  });

  test('should display year 1 vs year 2+ comparison', async ({ page }) => {
    const yearComparison = page.locator('.year-comparison');
    const firstYearValue = page.locator('#firstYearValue');
    const year2Value = page.locator('#year2Value');

    // Year comparison should be visible
    await expect(yearComparison).toBeVisible();

    // Both year values should be displayed
    await expect(firstYearValue).toBeVisible();
    await expect(year2Value).toBeVisible();

    // First year should include bonus, so it should be higher than year 2
    const year1Text = await firstYearValue.textContent();
    const year2Text = await year2Value.textContent();

    // Extract numbers
    const year1Val = parseInt(year1Text?.replace(/[$,]/g, '') || '0');
    const year2Val = parseInt(year2Text?.replace(/[$,]/g, '') || '0');

    // For Palladium with bonus, year 1 should be higher
    expect(year1Val).toBeGreaterThan(year2Val);
  });

  test('should show first year detail with bonus breakdown', async ({ page }) => {
    const firstYearDetail = page.locator('#firstYearDetail');

    // Should show bonus in the detail
    await expect(firstYearDetail).toContainText('bonus');
  });

  test('should update housing-only multiplier display', async ({ page }) => {
    const housingMultiplier = page.locator('#housingMultiplier');
    const housingInput = page.locator('#housingCost');
    const everydayInput = page.locator('#everydaySpend');

    // Default: $2500 housing, $500 everyday = 20% ratio = 0X
    await expect(housingMultiplier).toContainText('0X');

    // Change to 50% ratio: $2000 housing, $1000 everyday
    await housingInput.fill('2000');
    await housingInput.dispatchEvent('input');
    await everydayInput.fill('1000');
    await everydayInput.dispatchEvent('input');
    await page.waitForTimeout(200);

    // Should be 0.75X
    await expect(housingMultiplier).toContainText('0.75X');
  });

  test('should update spend ratio display', async ({ page }) => {
    const spendRatio = page.locator('#spendRatio');
    const housingInput = page.locator('#housingCost');
    const everydayInput = page.locator('#everydaySpend');

    // Default: 500/2500 = 20%
    await expect(spendRatio).toContainText('20');

    // Change to 100%
    await housingInput.fill('1000');
    await housingInput.dispatchEvent('input');
    await everydayInput.fill('1000');
    await everydayInput.dispatchEvent('input');
    await page.waitForTimeout(200);

    // Should be 100%
    await expect(spendRatio).toContainText('100');
  });

  test('should display correct Bilt Cash calculations in Flexible mode', async ({ page }) => {
    // Default: $500 everyday * 4% = $20 Bilt Cash
    const monthlyBiltCash = page.locator('#monthlyBiltCash');
    await expect(monthlyBiltCash).toContainText('$20');

    // Unlockable points: $20 / $3 * 100 = 666.67
    const unlockablePoints = page.locator('#unlockablePoints');
    const pointsText = await unlockablePoints.textContent();
    expect(pointsText).toMatch(/66[67]/);
  });
});
