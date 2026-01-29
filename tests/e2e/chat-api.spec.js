// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Chat API functionality', () => {
  test('should have GEMINI_API_KEY configured', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        message: 'Hello',
        context: {},
        history: []
      }
    });

    const data = await response.json();

    // Should not return "GEMINI_API_KEY not configured" error
    if (data.error) {
      expect(data.error).not.toContain('GEMINI_API_KEY not configured');
    }
  });

  test('should return a valid response from Gemini API', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        message: 'What is 1+1? Reply with just the number.',
        context: {
          housing: 2000,
          everydaySpend: 1000,
          card: 'blue',
          option: 'flexible'
        },
        history: []
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Should have a reply field
    expect(data).toHaveProperty('reply');
    expect(typeof data.reply).toBe('string');
    expect(data.reply.length).toBeGreaterThan(0);
  });

  test('should handle conversation history', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        message: 'Which card has no annual fee?',
        context: {
          housing: 2000,
          everydaySpend: 1000,
          card: 'blue',
          option: 'flexible'
        },
        history: [
          { role: 'user', content: 'Tell me about Bilt cards' },
          { role: 'assistant', content: 'Bilt offers three cards: Blue, Obsidian, and Palladium.' }
        ]
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('reply');
    // Response should mention Blue card (the one with no annual fee)
    expect(data.reply.toLowerCase()).toContain('blue');
  });
});
