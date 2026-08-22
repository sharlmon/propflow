import { expect, test } from '@playwright/test';

const landlord = { email: 'landlord@propflow.demo', password: 'DemoPass2026!' };
const renter = { email: 'renter@propflow.demo', password: 'DemoPass2026!' };

async function signIn(page: import('@playwright/test').Page, account: typeof landlord) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(
    account.email === landlord.email ? '/landlord/dashboard' : '/renter/dashboard',
  );
}

async function signOut(page: import('@playwright/test').Page) {
  if ((await page.getByRole('button', { name: 'Sign out' }).count()) === 0) {
    await page.getByRole('link', { name: 'Dashboard' }).click();
  }
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL('/login');
}

test('landlord-to-renter golden path', async ({ page }) => {
  const suffix = Date.now().toString().slice(-7);
  const property = `Demo Court ${suffix}`;
  const unit = `E2E-${suffix}`;
  const listing = `${property} · Unit ${unit}`;
  const maintenance = `E2E tap leak ${suffix}`;

  await signIn(page, landlord);
  await expect(page.getByRole('heading', { name: 'Landlord dashboard' })).toBeVisible();
  await page.getByRole('link', { name: 'Properties', exact: true }).click();
  await page.getByRole('link', { name: 'Add property' }).click();
  await page.getByLabel('Property name').fill(property);
  await page.getByLabel('Description').fill('A deterministic golden-path demonstration property.');
  await page.getByLabel('Street address').fill('26 Demo Avenue');
  await page.getByLabel('Locality').fill('South B');
  await page.getByLabel('County').fill('Nairobi');
  await page.getByRole('button', { name: 'Create property' }).click();
  await expect(page.getByRole('heading', { name: property })).toBeVisible();

  await page.getByLabel('Unit label').fill(unit);
  await page.getByLabel('Bedrooms').fill('2');
  await page.getByLabel('Bathrooms').fill('1');
  await page.getByLabel('Monthly rent (KES)').fill('42000');
  await page.getByLabel('Deposit (KES)').fill('42000');
  await page.getByRole('button', { name: 'Add unit' }).click();
  const unitRow = page.getByRole('row').filter({ hasText: unit });
  await expect(unitRow).toBeVisible();
  await unitRow.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByRole('status')).toContainText('Listing published');
  await signOut(page);

  await page.goto('/listings');
  await page.getByLabel('Search').fill(property);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: listing })).toBeVisible();
  await signIn(page, renter);
  await page.goto(`/listings?query=${encodeURIComponent(property)}`);
  await page.getByRole('link', { name: 'View home' }).click();
  await page
    .getByLabel('Message to the landlord')
    .fill('I would like to view this demo home tomorrow afternoon.');
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(page.getByRole('status')).toContainText('Inquiry sent');
  await signOut(page);

  await signIn(page, landlord);
  await page.getByRole('link', { name: 'Inquiries', exact: true }).click();
  const inquiry = page.locator('article').filter({ hasText: listing });
  await expect(inquiry).toBeVisible();
  await inquiry.getByRole('combobox').selectOption('accepted');
  await page.getByRole('link', { name: 'Tenancies', exact: true }).click();
  await page.getByRole('button', { name: 'Create tenancy' }).click();
  await page.getByLabel('Available unit').selectOption({ label: `${property} · ${unit}` });
  await page.getByLabel('Renter').selectOption({ label: 'Wanjiku Njeri · renter@propflow.demo' });
  await page.getByLabel('Start date').fill('2026-09-01');
  await page.getByLabel('End date (optional)').fill('2027-08-31');
  await page.getByLabel('Monthly rent').fill('42000');
  await page.getByLabel('Deposit').fill('42000');
  await page.getByRole('button', { name: 'Create active tenancy' }).click();
  await expect(page.getByRole('row').filter({ hasText: property })).toBeVisible();
  await signOut(page);

  await signIn(page, renter);
  await page.getByRole('link', { name: 'Maintenance', exact: true }).click();
  await page.getByRole('button', { name: 'New request' }).click();
  await page.getByLabel('Tenancy').selectOption({ label: `${property} · ${unit}` });
  await page.getByLabel('Title').fill(maintenance);
  await page.getByLabel('Priority').selectOption('medium');
  await page.getByLabel('Description').fill('The kitchen tap continues to leak after being closed.');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByRole('heading', { name: maintenance })).toBeVisible();
  await signOut(page);

  await signIn(page, landlord);
  await page.getByRole('link', { name: 'Maintenance', exact: true }).click();
  const request = page.locator('article').filter({ hasText: maintenance });
  await expect(request).toBeVisible();
  await request.getByRole('combobox', { name: `Status for ${maintenance}` }).selectOption('acknowledged');
  await expect(request.getByRole('combobox', { name: `Status for ${maintenance}` })).toHaveValue(
    'acknowledged',
  );
});
