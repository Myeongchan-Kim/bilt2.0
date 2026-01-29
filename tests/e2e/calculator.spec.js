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
    const housingInput = page.locator('#housingCost');

    // Change housing to $3000
    await housingInput.fill('3000');
    // Trigger input event
    await housingInput.dispatchEvent('input');

    // Wait for calculation update
    await page.waitForTimeout(200);

    // Check that results have updated (spend ratio should change)
    const spendRatio = page.locator('#spendRatio');
    // With housing $3000 and everyday $500, ratio = 500/3000 = 16.67%
    await expect(spendRatio).toContainText('16');
  });

  test('should update results when everyday spend input changes', async ({ page }) => {
    const everydayInput = page.locator('#everydaySpend');

    // Change everyday spend to $1000
    await everydayInput.fill('1000');
    // Trigger input event
    await everydayInput.dispatchEvent('input');

    // Wait for calculation update
    await page.waitForTimeout(200);

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
    // Default hotel value is $400+
    const benefitsDetail = page.locator('#benefitsDetail');
    await expect(benefitsDetail).toContainText('400');

    // Click the label for $100 hotel value
    await page.locator('label[for="hotel100"]').click();
    await page.waitForTimeout(200);

    // Benefits detail should show $100 for hotel
    await expect(benefitsDetail).toContainText('100');

    // Test $0 hotel value
    await page.locator('label[for="hotel0"]').click();
    await page.waitForTimeout(200);

    // With $0 hotel, Palladium should only show Cash $200
    await expect(benefitsDetail).toContainText('Cash $200');
    // Benefits should be $200 (only cash bonus, no hotel)
    const annualBenefits = page.locator('#annualBenefits');
    await expect(annualBenefits).toContainText('$200');
  });
});
