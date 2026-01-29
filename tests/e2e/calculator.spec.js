// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Calculator functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for calculator to initialize
    await page.waitForSelector('#annualValue');
  });

  test('should display default values on load', async ({ page }) => {
    // Check default input values
    const housingInput = page.locator('#housingCost');
    const everydayInput = page.locator('#everydaySpend');

    await expect(housingInput).toHaveValue('2500');
    await expect(everydayInput).toHaveValue('500');

    // Check default card selection (Palladium)
    const palladiumRadio = page.locator('#cardPalladium');
    await expect(palladiumRadio).toBeChecked();

    // Check default option (Flexible)
    const flexibleRadio = page.locator('#optionFlexible');
    await expect(flexibleRadio).toBeChecked();
  });

  test('should update results when housing input changes', async ({ page }) => {
    // Change housing to $3000 and trigger calculation
    await page.evaluate(() => {
      const input = document.getElementById('housingCost');
      input.value = '3000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Wait for calculation update
    await page.waitForTimeout(300);

    // Check that results have updated (spend ratio should change)
    const spendRatio = page.locator('#spendRatio');
    // With housing $3000 and everyday $500, ratio = 500/3000 = 16.67%
    await expect(spendRatio).toContainText('16');
  });

  test('should update results when everyday spend input changes', async ({ page }) => {
    // Change everyday spend to $1000 and trigger calculation
    await page.evaluate(() => {
      const input = document.getElementById('everydaySpend');
      input.value = '1000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Wait for calculation update
    await page.waitForTimeout(300);

    // Check that results have updated
    const spendRatio = page.locator('#spendRatio');
    // With housing $2500 and everyday $1000, ratio = 1000/2500 = 40%
    await expect(spendRatio).toContainText('40');
  });

  test('should calculate correct everyday points for Palladium (2X)', async ({ page }) => {
    // Default: $500 everyday spend with Palladium (2X)
    // Expected: 500 * 2 = 1,000 points
    const everydayFormula = page.locator('#everydayFormula');
    const monthlyEverydayPoints = page.locator('#monthlyEverydayPoints');

    await expect(everydayFormula).toContainText('2X');
    await expect(monthlyEverydayPoints).toContainText('1,000');
  });

  test('should calculate annual points correctly', async ({ page }) => {
    // With default values (Palladium, Flexible, $2500 housing, $500 everyday)
    const annualPoints = page.locator('#annualPoints');
    const annualValue = await annualPoints.textContent();

    // Should contain a number with comma formatting
    expect(annualValue).toMatch(/\d+,?\d+/);
  });

  test('should show correct annual value calculation', async ({ page }) => {
    const annualValue = page.locator('#annualValue');
    const value = await annualValue.textContent();

    // Should display a dollar amount
    expect(value).toMatch(/\$[\d,]+/);
  });

  test('should update hotel value selection and recalculate', async ({ page }) => {
    const benefitsDetail = page.locator('#benefitsDetail');
    const annualBenefits = page.locator('#annualBenefits');

    // Wait for initial calculation to complete (default hotel is $100)
    await page.waitForTimeout(300);

    // Verify initial state shows Hotel $100 + Cash $200 for Palladium
    // Default hotel is $100, Palladium has $200 cash bonus
    await expect(benefitsDetail).toContainText('Hotel $100');

    // Select $400+ hotel value using evaluate
    await page.evaluate(() => {
      const radio = document.getElementById('hotel400');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // Benefits detail should show $400 for hotel
    await expect(benefitsDetail).toContainText('400');

    // Test $0 hotel value
    await page.evaluate(() => {
      const radio = document.getElementById('hotel0');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // With $0 hotel, Palladium should only show Cash $200
    await expect(benefitsDetail).toContainText('Cash $200');
    // Benefits should be $200 (only cash bonus, no hotel)
    await expect(annualBenefits).toContainText('$200');
  });
});
