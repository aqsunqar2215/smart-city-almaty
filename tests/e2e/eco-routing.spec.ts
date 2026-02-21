import { expect, test } from '@playwright/test';

const mockedEcoResponse = {
  status: 'ok',
  mode: 'road',
  degraded: false,
  routes: [
    {
      id: 'r1',
      type: 'recommended',
      source: 'road',
      mode: 'road',
      polyline: [
        [43.238, 76.9456],
        [43.229, 76.935],
        [43.219, 76.918],
        [43.2022, 76.8933],
      ],
      distance_m: 8300,
      eta_s: 1180,
      avg_traffic: 47,
      avg_aqi: 71,
      aqi_exposure: 83980,
      co2_g: 1520,
      eco_score: 82,
      compare_fastest: {
        delta_time_s: 140,
        delta_aqi_exposure: -18900,
        delta_co2_g: -260,
      },
      explanation: 'Road-verified cleanest route with moderate delay',
      degraded: false,
      aqi_profile: [54, 62, 71, 88],
    },
    {
      id: 'r2',
      type: 'alternative',
      source: 'road',
      mode: 'road',
      polyline: [
        [43.238, 76.9456],
        [43.221, 76.93],
        [43.2022, 76.8933],
      ],
      distance_m: 7900,
      eta_s: 1040,
      avg_traffic: 58,
      avg_aqi: 95,
      aqi_exposure: 102880,
      co2_g: 1780,
      eco_score: 68,
      compare_fastest: {
        delta_time_s: 0,
        delta_aqi_exposure: 0,
        delta_co2_g: 0,
      },
      explanation: 'Fastest baseline option with higher environmental exposure',
      degraded: false,
      aqi_profile: [85, 97, 102],
    },
    {
      id: 'r3',
      type: 'alternative',
      source: 'road',
      mode: 'road',
      polyline: [
        [43.238, 76.9456],
        [43.226, 76.922],
        [43.214, 76.905],
        [43.2022, 76.8933],
      ],
      distance_m: 9100,
      eta_s: 1320,
      avg_traffic: 52,
      avg_aqi: 82,
      aqi_exposure: 90040,
      co2_g: 1640,
      eco_score: 75,
      compare_fastest: {
        delta_time_s: 280,
        delta_aqi_exposure: -12840,
        delta_co2_g: -140,
      },
      explanation: 'Alternative road option with different eco/time trade-off',
      degraded: false,
      aqi_profile: [69, 75, 86, 95],
    },
  ],
};

test('eco routing renders 3+ routes with baseline comparison', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: 'e2e-user', email: 'e2e@smart.city', username: 'E2E User' })
    );
  });

  await page.route('**/api/routing/eco', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedEcoResponse),
    });
  });

  await page.goto('/eco-routing');
  await page.getByRole('button', { name: 'Demo Analysis' }).click();

  await expect(page.locator('[data-testid="route-card"]')).toHaveCount(3);
  await expect(page.locator('[data-testid="route-card"]').first().getByText('Road Verified').first()).toBeVisible();
  await expect(page.getByText('+2 min')).toBeVisible();
  await expect(page.getByText('-18900 exp')).toBeVisible();
});
