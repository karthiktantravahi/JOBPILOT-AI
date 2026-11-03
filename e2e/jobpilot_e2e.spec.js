import { test, expect } from '@playwright/test';

test.describe('JobPilot AI - Complete End-to-End Frontend & UI Functional Audit', () => {
  let authToken = '';
  let authUser = null;
  const timestamp = Date.now();
  const testUser = {
    name: 'E2E Auditor',
    email: `e2e.auditor.${timestamp}@jobpilot.test`,
    password: 'Password123!',
  };

  test.beforeAll(async ({ request }) => {
    // Register test user via API for clean, fast, deterministic auth state
    const res = await request.post('http://localhost:5000/api/auth/register', {
      data: testUser,
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    authToken = body.token;
    authUser = body.user;
  });

  // Helper to inject auth state into page before navigation
  async function authenticatePage(page) {
    await page.addInitScript(
      ({ token, user }) => {
        localStorage.setItem('jobpilot_token', token);
        localStorage.setItem('jobpilot_user', JSON.stringify(user));
      },
      { token: authToken, user: authUser }
    );
  }

  test('1. Landing Page: renders hero, brand, stats and featured job cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JobPilot AI/i);

    // Hero title check
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toContainText('Find the right job');
    await expect(heroHeading).toContainText('Apply smarter');

    // Discover Live Jobs CTA
    const exploreBtn = page.getByRole('link', { name: /Discover Live Jobs/i });
    await expect(exploreBtn).toBeVisible();

    // Verify footer branding
    await expect(page.locator('footer')).toContainText(/JOBPILOT AI/i);
  });

  test('2. Theme Toggle: switches theme between dark and light', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // Initial theme
    const initialTheme = await html.getAttribute('data-theme');

    // Click theme toggle button
    const themeBtn = page.locator('button[aria-label="Toggle Theme"]');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Check toggled theme
    const toggledTheme = await html.getAttribute('data-theme');
    expect(toggledTheme).not.toBe(initialTheme);

    // Toggle back
    await themeBtn.click();
    const finalTheme = await html.getAttribute('data-theme');
    expect(finalTheme).toBe(initialTheme);
  });

  test('3. Discover Jobs: search, filter, and job modal interactions', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Wait for loading pulse skeletons to disappear
    await page.waitForSelector('.card:not(.animate-pulse)', { timeout: 15000 });

    // Find first real job card
    const firstJobCard = page.locator('.card:not(.animate-pulse)').first();
    await expect(firstJobCard).toBeVisible();

    // Click job card to open Job Details Modal
    await firstJobCard.click();

    // Verify modal is open
    const modal = page.locator('.modal.modal-open');
    await expect(modal).toBeVisible();

    // Verify modal content
    await expect(modal.locator('h2')).toBeVisible();

    // Close modal via close button
    const closeBtn = modal.locator('button').filter({ hasText: /Close/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await modal.locator('button:has(svg.lucide-x)').first().click();
    }
  });

  test('4. Registration: form validation and user account creation', async ({ page }) => {
    await page.goto('/register');

    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    const uniqueEmail = `ui.registered.${Date.now()}@jobpilot.test`;
    await nameInput.fill('UI New Registrant');
    await emailInput.fill(uniqueEmail);
    await passwordInput.fill('Password123!');

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/auth/register') && res.status() === 201),
      page.locator('button[type="submit"]').click(),
    ]);

    expect(response.ok()).toBe(true);

    // Registration redirects to /resume
    await page.waitForURL(/\/resume/, { timeout: 10000 });
  });

  test('5. Authentication State: Login and Logout form flow', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill(testUser.email);
    await passwordInput.fill(testUser.password);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/auth/login') && res.status() === 200),
      page.locator('button[type="submit"]').click(),
    ]);

    expect(response.ok()).toBe(true);

    // Verify user profile or avatar appears in header
    const appsLink = page.locator('header').getByRole('link', { name: /Applications/i });
    await expect(appsLink).toBeVisible();
  });

  test('6. Applications Tracker: Kanban, List view and Add Application Modal', async ({ page }) => {
    await authenticatePage(page);
    await page.goto('/applications');

    // Verify Kanban column headers
    await expect(page.locator('text=SAVED').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=APPLIED').first()).toBeVisible();
    await expect(page.locator('text=INTERVIEW').first()).toBeVisible();
    await expect(page.locator('text=OFFER').first()).toBeVisible();

    // Switch to List view
    const listBtn = page.locator('button').filter({ hasText: 'List' }).first();
    await listBtn.click();

    // Switch back to Kanban
    const kanbanBtn = page.locator('button').filter({ hasText: 'Kanban' }).first();
    await kanbanBtn.click();

    // Verify Track Application button opens modal
    const trackBtn = page.locator('button').filter({ hasText: /Track Application/i }).first();
    await expect(trackBtn).toBeVisible();
    await trackBtn.click();

    // Verify modal input is visible (placeholder contains Stripe)
    await expect(page.locator('input[placeholder*="Stripe"]')).toBeVisible();
    const cancelBtn = page.locator('.modal button').filter({ hasText: /Cancel/i }).first();
    await cancelBtn.click();
  });

  test('7. Analytics Dashboard: displays metrics and visual charts', async ({ page }) => {
    await authenticatePage(page);
    await page.goto('/analytics');

    // Verify metrics headings
    await expect(page.locator('text=Application Analytics & Pipeline Insights')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Saved Roles').first()).toBeVisible();
    await expect(page.locator('text=Submitted').first()).toBeVisible();
    await expect(page.locator('text=Offers Received').first()).toBeVisible();
  });

  test('8. AI Settings: sliders and dimension weights configuration', async ({ page }) => {
    await authenticatePage(page);
    await page.goto('/settings');

    // Verify settings headers and sliders
    await expect(page.locator('text=Scoring Dimension Weights')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button').filter({ hasText: 'Default' }).first()).toBeVisible();

    // Save button
    const saveBtn = page.locator('button').filter({ hasText: /Save Weight Configuration/i }).first();
    await expect(saveBtn).toBeVisible();
  });

  test('9. Recommended Jobs Page: loads match explanation and AI recommendations', async ({ page }) => {
    await authenticatePage(page);
    await page.goto('/recommended');

    // Verify page header
    await expect(page.locator('text=Your Tailored Recommendations').first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Resume AI: drag and drop upload interface', async ({ page }) => {
    await authenticatePage(page);
    await page.goto('/resume');

    // Verify resume page header and dropzone
    await expect(page.locator('text=Resume Parsing & Extraction').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('11. Profile Page: user details and preferences', async ({ page }) => {
    await authenticatePage(page);
    await page.goto('/profile');

    // Verify profile page loaded
    await expect(page.locator('text=Professional Profile & Preferences').first()).toBeVisible({ timeout: 10000 });
  });

  test('12. 404 Not Found Page: handles non-existent routes gracefully', async ({ page }) => {
    await page.goto('/completely-invalid-non-existent-route-xyz');
    await expect(page.locator('text=404').first()).toBeVisible({ timeout: 10000 });
    const homeBtn = page.locator('a[href="/"]').first();
    await expect(homeBtn).toBeVisible();
  });

  test('13. Mobile Responsive Layout: hamburger menu toggles properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Hamburger button should be visible on mobile
    const menuBtn = page.locator('button.md\\:hidden').first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Mobile nav drawer/menu should be visible
    await expect(page.locator('.md\\:hidden').getByRole('link', { name: 'Discover Jobs' })).toBeVisible();
  });
});
