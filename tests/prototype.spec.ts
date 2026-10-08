import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function openView(page: Page, view = 'home') {
  const titles: Record<string, string> = {
    home: 'Welcome', overzicht: 'Overview', taak: 'Post a task', matches: 'Your matches',
    profiel: 'Talent profile', bevestiging: 'Confirm project', project: 'Project workspace',
    talent: 'For talent', feedback: 'Expert feedback', screens: 'Screen overview',
  };
  await page.goto(view === 'home' ? '/' : `/#${view}`);
  await expect(page).toHaveTitle(view === 'home' ? 'TaskJuvo — Your task. The right talent.' : `${titles[view]} · TaskJuvo`);
  if (view !== 'home') await expect(page.locator('.breadcrumb strong')).toHaveText(titles[view]);
  await expect(page.locator('#main-content h1')).toBeVisible();
}

async function completeExampleTask(page: Page) {
  await openView(page, 'taak');
  await page.getByRole('button', { name: 'Fill in example' }).click();
  await expect(page.getByLabel('Task title')).toHaveValue('Competitor analysis for expansion into Germany');
  await expectNoOverflow(page, 'Wizard step 1');
  for (const title of [
    'What should be delivered?',
    'Which skills does your task need?',
    'Set clear expectations.',
    'Ready to find your match?',
  ]) {
    await page.getByRole('button', { name: 'Next step' }).click();
    const heading = page.getByRole('heading', { name: title, exact: true });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();
    await expectNoOverflow(page, `Wizard: ${title}`);
  }
  await expect(page.locator('.wizard-review-practical')).toContainText('€');
  await expect(page.locator('.wizard-review-practical')).toContainText('300');
  await expect(page.locator('.wizard-review-skills')).toContainText('Market research');
  await expect(page.locator('.wizard-review-skills')).toContainText('Excel');
  await expect(page.locator('.wizard-review-skills')).toContainText('PowerPoint');
  await page.getByRole('button', { name: 'Find matching talent' }).click();
  await expect(page).toHaveURL(/#matches$/);
  await expect(page.getByRole('heading', { name: 'Three matches. One clear task.' })).toBeFocused();
}

async function expectNoOverflow(page: Page, label: string) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect.soft(sizes.document, `${label}: document has horizontal overflow`).toBeLessThanOrEqual(sizes.viewport + 1);
  expect.soft(sizes.body, `${label}: body has horizontal overflow`).toBeLessThanOrEqual(sizes.viewport + 1);
}

test('five-step business task through comparison, profile and project review', async ({ page }) => {
  await completeExampleTask(page);
  await expect(page.locator('.match-card')).toHaveCount(3);
  await page.getByRole('checkbox', { name: 'Compare Emma de Vries' }).check();
  await page.getByRole('checkbox', { name: 'Compare Lucas van Dijk' }).check();
  await page.getByRole('button', { name: 'Compare 2 talents' }).click();
  await expect(page.getByRole('table')).toContainText('Emma de Vries');
  await expect(page.getByRole('table')).toContainText('Lucas van Dijk');
  await page.locator('.match-card').first().getByRole('button', { name: 'View profile' }).click();
  await expect(page.getByRole('heading', { name: 'Emma de Vries', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Verified skills' })).toBeVisible();
  await page.getByRole('button', { name: 'What does TaskJuvo Verified mean?' }).click();
  const verified = page.getByRole('dialog', { name: 'What does TaskJuvo Verified mean?' });
  await expect(verified).toBeVisible();
  await expect(verified).toContainText('fictional');
  await page.keyboard.press('Escape');
  await expect(verified).not.toBeVisible();
  await page.getByRole('button', { name: 'Select Emma', exact: true }).click();
  await expect(page).toHaveURL(/#(?:bevestiging|confirm-project)$/);
  await expect(page.getByRole('heading', { name: 'Your agreed deliverables' })).toBeVisible();
  await expect(page.locator('.project-concept-label')).toContainText('not a legally binding guarantee');
  await page.getByRole('button', { name: 'Back to profile', exact: true }).click();
  await expect(page).toHaveURL(/#(?:profiel|profile)$/);
  await page.getByRole('button', { name: 'Select Emma', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm project', exact: true }).click();
  await expect(page).toHaveURL(/#(?:project|workspace)$/);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await page.getByRole('button', { name: 'View deliverable', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Review: Analysis & insights' });
  await expect(review).toBeVisible();
  await review.getByRole('button', { name: 'Approve milestone' }).click();
  await expect(review).not.toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2');
  await expect(page.locator('.project-notice')).toContainText('The next milestone is now in progress.');

  const messageButton = page.getByRole('button', { name: 'Message Emma' });
  await messageButton.click();
  const message = page.getByRole('dialog', { name: 'Message Emma' });
  await message.getByLabel('Your message').fill('Could you explain the sources you used?');
  await message.getByRole('button', { name: 'Save message locally' }).click();
  await expect(message.getByRole('status')).toContainText('Nothing has been sent.');
  await page.keyboard.press('Escape');
  await expect(messageButton).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: /Message Emma/ }).click();
  await expect(page.getByRole('dialog', { name: 'Message Emma' })).toContainText('Could you explain the sources you used?');
});

test('empty title and context show field errors and focus the first invalid field', async ({ page }) => {
  await openView(page, 'taak');
  await page.getByRole('button', { name: 'Next step' }).click();
  const title = page.getByLabel('Task title');
  await expect(title).toBeFocused();
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Give your task a clear title.')).toBeVisible();
  await expect(page.getByText('Describe the context and what you need.')).toBeVisible();
  await title.fill('Competitor analysis for Germany');
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.getByLabel('Context and challenge')).toBeFocused();
  await page.getByLabel('Context and challenge').fill('We want to compare our offer and prices with five competitors in Germany.');
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.getByRole('heading', { name: 'What should be delivered?' })).toBeVisible();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('#wizard-deliverables')).toBeFocused();
  await expect(page.getByText('Select or add at least one deliverable.')).toBeVisible();
});

test('expert feedback persists locally and downloads as a readable file', async ({ page }) => {
  await openView(page, 'feedback');
  await page.getByLabel('Which part are you reviewing?').selectOption('Your matches');
  await page.getByLabel('What is your perspective?').selectOption('UX / accessibility');
  for (const legend of ['How clear is this part?', 'How convincing is the evidence?', 'How easy is the next step?']) {
    await page.getByRole('group', { name: legend, exact: true }).getByRole('radio', { name: '4 out of 5', exact: true }).check();
  }
  const commentField = page.getByLabel('What did you notice, and what would you improve?');
  await commentField.fill('     ');
  await page.getByRole('button', { name: 'Save feedback locally' }).click();
  await expect(commentField).toBeFocused();
  expect(await commentField.evaluate(node => (node as HTMLTextAreaElement).validity.valid)).toBe(false);
  await expect(page.getByRole('region', { name: 'Saved feedback' })).toHaveCount(0);
  const comment = "The comparison is clear; I would like the evidence to show the student's own contribution.";
  await commentField.fill(comment);
  await page.getByRole('button', { name: 'Save feedback locally' }).click();
  await expect(page.getByRole('status')).toContainText('Feedback saved locally.');
  await expect(page.getByRole('region', { name: 'Saved feedback' })).toContainText(comment);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download feedback' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('taskjuvo-expert-feedback.md');
  const file = await download.path();
  expect(file).not.toBeNull();
  const contents = await readFile(file!, 'utf8');
  expect(contents).toContain(comment);
  expect(contents).toContain('Clarity: 4/5');
  expect(contents).toContain('Your matches');
  await page.reload();
  await expect(page.getByRole('region', { name: 'Saved feedback' })).toContainText(comment);
});

test('exploring a sample workspace preserves a business owner’s task draft', async ({ page }) => {
  await openView(page, 'taak');
  const title = 'Customer research for our new product';
  const context = 'We want five customer interviews and a summary of the main purchase barriers.';
  await page.getByLabel('Task title').fill(title);
  await page.getByLabel('Context and challenge').fill(context);
  await openView(page, 'overzicht');
  await page.locator('.dashboard-project').nth(1).getByRole('button').click();
  await expect(page).toHaveURL(/#sample-workspace$/);
  await expect(page.getByRole('heading', { name: 'Project progress' })).toBeVisible();
  await expect(page.locator('#main-content h1')).not.toHaveText(title);
  await openView(page, 'taak');
  await expect(page.getByLabel('Task title')).toHaveValue(title);
  await expect(page.getByLabel('Context and challenge')).toHaveValue(context);
});

for (const width of [390, 320]) {
  test(`mobile ${width}px: screens fit, comparison stacks and navigation traps keyboard focus`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openView(page);
    await expectNoOverflow(page, `${width}px homepage`);
    await completeExampleTask(page);
    await expectNoOverflow(page, `${width}px matches`);
    await page.getByRole('checkbox', { name: 'Compare Emma de Vries' }).check();
    await page.getByRole('checkbox', { name: 'Compare Lucas van Dijk' }).check();
    await page.getByRole('button', { name: 'Compare 2 talents' }).click();
    await expect(page.locator('.comparison-mobile')).toBeVisible();
    await expect(page.locator('.comparison-desktop')).not.toBeVisible();
    await expectNoOverflow(page, `${width}px comparison`);
    const menu = page.getByRole('button', { name: 'Open navigation' });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const first = page.locator('#sidebar button').first();
    const last = page.locator('#sidebar button').last();
    await expect(first).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    for (const view of ['profiel', 'bevestiging', 'project', 'feedback', 'talent', 'overzicht', 'screens']) {
      await openView(page, view);
      await expectNoOverflow(page, `${width}px ${view}`);
    }
  });
}

test('reduced motion shortens transitions and dialog keyboard navigation remains usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openView(page, 'project');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  const button = page.getByRole('button', { name: 'View deliverable', exact: true });
  const duration = await button.evaluate(node => getComputedStyle(node).transitionDuration);
  expect(duration.split(',').every(value => parseFloat(value) <= 0.001)).toBe(true);
  await button.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Review: Analysis & insights' });
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 7; index++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();
});

test('automated WCAG A/AA checks across main screens and wizard steps', async ({ page }) => {
  test.setTimeout(120_000);
  async function check(label: string) {
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const violations = report.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map(node => ({ target: node.target, failure: node.failureSummary })),
    }));
    expect.soft(violations, `${label}: ${JSON.stringify(violations, null, 2)}`).toEqual([]);
  }
  await openView(page);
  await check('Homepage');
  await openView(page, 'taak');
  await page.getByRole('button', { name: 'Fill in example' }).click();
  for (let step = 1; step <= 5; step++) {
    await check(`Wizard step ${step}`);
    if (step < 5) await page.getByRole('button', { name: 'Next step' }).click();
  }
  for (const view of ['matches', 'profiel', 'bevestiging', 'project', 'feedback', 'screens']) {
    await openView(page, view);
    await check(view);
  }
});

test('all prototype views, form hints and accessibility labels are English', async ({ page }) => {
  const dutchFragments = /\b(?:jouw|taak|overzicht|profiel|vaardigheid|vaardigheden|werkruimte|marktonderzoek|fictief|fictieve|vergelijk|bevestig|terug naar|opgeslagen|ondersteuning|volgende stap|vorige stap|voorbeeld|voorbeelden|voorbeeldgegevens|eindpresentatie|duitsland|voor bedrijven|voor talent|wat moet er|wat wil je|geef feedback|klaar voor|resultaten bewerken|begin opnieuw|beschrijf|samenvatting|opdracht|oplevering|beoordeling|beoordelingen|beschikbaarheid|verplicht|dagen|uur|gecontroleerd|universiteit)\b/i;
  async function checkLanguage(label: string) {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const visibleText = await page.locator('body').innerText();
    const interfaceAttributes = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[aria-label], [placeholder], [title]'))
        .flatMap(node => ['aria-label', 'placeholder', 'title'].map(attribute => node.getAttribute(attribute) || ''))
        .join('\n')
    );
    expect.soft(visibleText, label).not.toMatch(dutchFragments);
    expect.soft(interfaceAttributes, label + ' accessible labels and hints').not.toMatch(dutchFragments);
  }
  for (const view of ['home', 'overzicht', 'matches', 'profiel', 'bevestiging', 'project', 'talent', 'feedback', 'screens']) {
    await openView(page, view);
    await checkLanguage(view);
  }
  await openView(page, 'taak');
  await page.getByRole('button', { name: 'Fill in example' }).click();
  for (let step = 1; step <= 5; step++) {
    await checkLanguage('Wizard step ' + step);
    if (step < 5) await page.getByRole('button', { name: 'Next step' }).click();
  }
});

test('screen overview opens every main view with a real preview image', async ({ page }) => {
  await openView(page);
  await page.getByRole('button', { name: 'Explore the demo', exact: true }).first().click();
  await expect(page).toHaveURL(/#screens$/);
  await expect(page.getByRole('heading', { name: 'One idea. A complete experience.' })).toBeFocused();
  await expect(page.locator('.screen-card')).toHaveCount(9);
  const screens = [
    { name: 'Homepage', route: 'home', title: 'TaskJuvo — Your task. The right talent.' },
    { name: 'Business overview', route: 'overview', title: 'Overview · TaskJuvo' },
    { name: 'Task wizard', route: 'post-a-task', title: 'Post a task · TaskJuvo' },
    { name: 'Curated matches', route: 'matches', title: 'Your matches · TaskJuvo' },
    { name: 'Talent profile', route: 'profile', title: 'Talent profile · TaskJuvo' },
    { name: 'Project confirmation', route: 'confirm-project', title: 'Confirm project · TaskJuvo' },
    { name: 'Project workspace', route: 'workspace', title: 'Project workspace · TaskJuvo' },
    { name: 'For talent', route: 'for-talent', title: 'For talent · TaskJuvo' },
    { name: 'Expert feedback', route: 'feedback', title: 'Expert feedback · TaskJuvo' },
  ];
  for (const screen of screens) {
    await openView(page, 'screens');
    const card = page.locator('.screen-card').filter({ has: page.getByRole('button', { name: `Open ${screen.name}`, exact: true }) });
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.locator('img').evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await card.getByRole('button', { name: `Open ${screen.name}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${screen.route}$`));
    await expect(page).toHaveTitle(screen.title);
    await expect(page.locator('#main-content h1')).toBeVisible();
  }
});
