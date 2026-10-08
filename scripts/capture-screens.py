"""Capture actual TaskJuvo pages for the product tour and expert review gallery."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parent.parent
artifact = root / 'artifacts'
previews = root / 'public' / 'previews'
artifact.mkdir(exist_ok=True)
previews.mkdir(parents=True, exist_ok=True)
base = os.environ.get('TASKJUVO_CAPTURE_URL', 'http://127.0.0.1:3003')
screens = [
    ('home', 'homepage', 'TaskJuvo — Your task. The right talent.'),
    ('overview', 'overview', 'Overview · TaskJuvo'),
    ('post-a-task', 'task-wizard', 'Post a task · TaskJuvo'),
    ('matches', 'matches', 'Your matches · TaskJuvo'),
    ('profile', 'profile', 'Talent profile · TaskJuvo'),
    ('confirm-project', 'confirmation', 'Confirm project · TaskJuvo'),
    ('workspace', 'workspace', 'Project workspace · TaskJuvo'),
    ('for-talent', 'talent', 'For talent · TaskJuvo'),
    ('feedback', 'feedback', 'Expert feedback · TaskJuvo'),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base, wait_until='networkidle')
    page.get_by_role('button', name='Post your first task').click()
    page.get_by_role('button', name='Fill in example').click()
    expect(page.get_by_label('Task title')).to_have_value('Competitor analysis for expansion into Germany')

    for route, name, title in screens:
        page.goto(base + ('' if route == 'home' else '/#' + route), wait_until='networkidle')
        expect(page).to_have_title(title)
        expect(page.locator('#main-content h1')).to_be_visible()
        page.evaluate('document.fonts.ready')
        page.screenshot(path=str(artifact / f'TaskJuvo-{name}.png'), full_page=True)
        page.screenshot(path=str(previews / f'{name}.jpg'), type='jpeg', quality=85, full_page=False)
        print(f'Captured {name}')

    page.goto(base + '/#screens', wait_until='networkidle')
    expect(page.get_by_role('heading', name='One idea. A complete experience.')).to_be_visible()
    page.locator('.screen-preview img').evaluate_all('(images) => images.forEach(image => image.loading = "eager")')
    page.wait_for_function('Array.from(document.querySelectorAll(".screen-preview img")).every(image => image.complete && image.naturalWidth > 0)')
    page.screenshot(path=str(artifact / 'TaskJuvo-screen-overview.png'), full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(base + '/#post-a-task', wait_until='networkidle')
    expect(page).to_have_title('Post a task · TaskJuvo')
    page.screenshot(path=str(artifact / 'TaskJuvo-mobile.png'), full_page=True)
    page.goto(base + '/#matches', wait_until='networkidle')
    page.screenshot(path=str(artifact / 'TaskJuvo-mobile-matches.png'), full_page=True)
    browser.close()
    if errors:
        raise SystemExit('Capture failed with browser errors: ' + '; '.join(errors))
    print('Captured 9 product screens, screen overview and 2 mobile views without JavaScript errors.')
