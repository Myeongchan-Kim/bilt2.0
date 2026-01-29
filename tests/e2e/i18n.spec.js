// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('i18n (internationalization) functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset language to default
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('#langToggle');
  });

  test('should have language toggle button showing 한국어 by default', async ({ page }) => {
    const langToggle = page.locator('#langToggle');
    await expect(langToggle).toBeVisible();
    // Default is English, so button shows option to switch to Korean
    await expect(langToggle).toHaveText('한국어');
  });

  test('should toggle to Korean and show Korean translations', async ({ page }) => {
    const langToggle = page.locator('#langToggle');
    const resultsHeader = page.locator('[data-i18n="results"]');

    // Default should be English
    await expect(resultsHeader).toHaveText('Results');

    // Toggle to Korean using JavaScript
    await page.evaluate(() => {
      window.i18n.toggle();
    });
    await page.waitForTimeout(500);

    // Check that Korean translations are applied
    await expect(resultsHeader).toHaveText('결과');
    await expect(langToggle).toHaveText('English');

    const cardComparison = page.locator('[data-i18n="card_comparison"]');
    await expect(cardComparison).toHaveText('카드 비교 (연간)');
  });

  test('should toggle back to English', async ({ page }) => {
    const langToggle = page.locator('#langToggle');
    const resultsHeader = page.locator('[data-i18n="results"]');

    // Switch to Korean first
    await page.evaluate(() => {
      window.i18n.toggle();
    });
    await page.waitForTimeout(500);
    await expect(resultsHeader).toHaveText('결과');

    // Switch back to English
    await page.evaluate(() => {
      window.i18n.toggle();
    });
    await page.waitForTimeout(500);

    // Check English translations
    await expect(resultsHeader).toHaveText('Results');
    await expect(langToggle).toHaveText('한국어');
  });

  test('should have data-i18n attributes on key elements', async ({ page }) => {
    // Check that i18n attributes exist
    const calculatorHeader = page.locator('[data-i18n="calculator"]');
    await expect(calculatorHeader).toBeVisible();

    const resultsHeader = page.locator('[data-i18n="results"]');
    await expect(resultsHeader).toBeVisible();

    const spendSettings = page.locator('[data-i18n="spend_settings"]');
    await expect(spendSettings).toBeVisible();

    const cardSelection = page.locator('[data-i18n="card_selection"]');
    await expect(cardSelection).toBeVisible();
  });

  test('should have translated tooltips with data-i18n-html', async ({ page }) => {
    // Check tooltip elements exist
    const housingTooltip = page.locator('[data-i18n-html="tooltip_housing_input"]');
    await expect(housingTooltip).toHaveCount(1);

    const everydayTooltip = page.locator('[data-i18n-html="tooltip_everyday_input"]');
    await expect(everydayTooltip).toHaveCount(1);

    const rewardTooltip = page.locator('[data-i18n-html="tooltip_reward_option"]');
    await expect(rewardTooltip).toHaveCount(1);
  });

  test('should have translated placeholders with data-i18n-placeholder', async ({ page }) => {
    const apiKeyInput = page.locator('[data-i18n-placeholder="enter_api_key"]');
    await expect(apiKeyInput).toHaveCount(1);

    const chatInput = page.locator('[data-i18n-placeholder="enter_question"]');
    await expect(chatInput).toHaveCount(1);
  });

  test('should maintain functionality after language toggle', async ({ page }) => {
    const langToggle = page.locator('#langToggle');
    const housingInput = page.locator('#housingCost');
    const spendRatio = page.locator('#spendRatio');

    // Toggle language
    await langToggle.click();
    await page.waitForTimeout(100);

    // Calculator should still work
    await housingInput.fill('3000');
    await housingInput.blur();
    await page.waitForTimeout(100);

    // Ratio should update correctly
    const ratioText = await spendRatio.textContent();
    expect(ratioText).toMatch(/\d+/);
  });

  test('should have translated quick questions in chat', async ({ page }) => {
    const quickQuestions = page.locator('.quick-question');
    await expect(quickQuestions).toHaveCount(3);

    // Check that they have data-question-key attributes
    const q1 = page.locator('[data-question-key="q_point_vs_cash"]');
    await expect(q1).toBeVisible();

    const q2 = page.locator('[data-question-key="q_best_card"]');
    await expect(q2).toBeVisible();

    const q3 = page.locator('[data-question-key="q_option_diff"]');
    await expect(q3).toBeVisible();
  });

  test('should have AI assistant label translated', async ({ page }) => {
    const aiLabel = page.locator('[data-i18n="ai_assistant"]');
    await expect(aiLabel).toBeVisible();
  });

  test('should have card comparison header translated', async ({ page }) => {
    const comparisonHeader = page.locator('[data-i18n="card_comparison"]');
    await expect(comparisonHeader).toBeVisible();
  });
});
