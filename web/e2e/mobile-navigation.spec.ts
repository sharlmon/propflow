import { expect, test } from '@playwright/test';

async function expectNoHorizontalPageOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

test('360px public and landlord navigation remains usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Find a home. Manage it with confidence.' })).toBeVisible();
  await expectNoHorizontalPageOverflow(page);

  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'Browse rentals' }).first().click();
  await expect(page).toHaveURL('/listings');
  await expectNoHorizontalPageOverflow(page);

  await page.goto('/login');
  await page.getByLabel('Email').fill('landlord@propflow.demo');
  await page.getByLabel('Password').fill('DemoPass2026!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Landlord dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Toggle portal navigation' }).click();
  await page.getByRole('link', { name: 'Properties', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
});
