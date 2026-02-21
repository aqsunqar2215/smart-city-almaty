import { expect, test } from '@playwright/test';

type AnalyzeBody = {
  query: string;
  context?: {
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
};

test('chat context: login + 3-turn dialog keeps context and API contract stable', async ({ page }) => {
  const analyzeRequests: AnalyzeBody[] = [];

  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        token: 'mock-jwt-token',
        user: { id: 999, email: 'e2e@smart.city', username: 'E2E User' },
      }),
    });
  });

  await page.route('**/api/sensors/qa', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ aqi: 78, pm25: 26, pm10: 40, o3: 21, no2: 14 }),
    });
  });

  await page.route('**/api/transport/traffic', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ congestion_level: 6, avg_speed_kmh: 31, incidents: 2 }),
    });
  });

  await page.route('**/api/ai/analyze', async (route) => {
    const body = (route.request().postDataJSON() || {}) as AnalyzeBody;
    analyzeRequests.push(body);
    const q = (body.query || '').toLowerCase();

    let response = 'General city update.';
    let intent_detected = 'CITY';
    if (q.includes('traffic')) {
      response = 'Traffic is moderate now. Congestion around 60% with average speed 31 km/h.';
      intent_detected = 'TRANSPORT';
    } else if (q.includes('air quality')) {
      response = 'Air quality is moderate. AQI is 78 and PM2.5 is 26.';
      intent_detected = 'WEATHER_ECO';
    } else if (q.includes('what about it')) {
      const history = body.context?.history || [];
      const hasAirInHistory = history.some((m) => m.role === 'user' && m.content.toLowerCase().includes('air quality'));
      response = hasAirInHistory
        ? 'Continuing air quality topic: AQI remains 78 and PM2.5 remains 26.'
        : 'Please clarify what topic you mean.';
      intent_detected = hasAirInHistory ? 'WEATHER_ECO' : 'HELP';
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        response,
        intent_detected,
        intent_confidence: 92.1,
        engine: 'SmartCityAlmaty-Neural-V3',
        source: 'retrieval_factual',
        web_sources: [],
        language: 'en',
        proactive_suggestions: ['Use less busy routes'],
        processing_time_ms: 112.4,
      }),
    });
  });

  await page.goto('/auth');

  const suffix = Date.now();
  await page.getByRole('tab', { name: 'Sign Up' }).click();
  await page.locator('#register-username').fill(`E2E ${suffix}`);
  await page.locator('#register-email').fill(`e2e_${suffix}@smart.city`);
  await page.locator('#register-password').fill('password123');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL('/');

  await page.getByTestId('neural-widget-open').click();
  await expect(page.getByTestId('neural-widget-input')).toBeVisible();

  const sendTurn = async (text: string) => {
    await page.getByTestId('neural-widget-input').fill(text);
    await page.getByTestId('neural-widget-send').click();
    await expect(page.getByTestId('neural-message-assistant').last()).toBeVisible({ timeout: 20000 });
  };

  await sendTurn('Show current traffic status');
  await sendTurn('What about air quality?');
  await sendTurn('And what about it?');

  await expect(page.getByTestId('neural-message-assistant').last()).toContainText('air quality topic', { timeout: 20000 });

  expect(analyzeRequests.length).toBeGreaterThanOrEqual(3);
  for (const req of analyzeRequests) {
    expect(typeof req.query).toBe('string');
    expect(req.query.length).toBeGreaterThan(0);
    expect(req.context).toBeTruthy();
  }
});
