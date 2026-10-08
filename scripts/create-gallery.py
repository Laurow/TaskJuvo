"""Create a lightweight offline gallery for the captured prototype screens."""
from pathlib import Path
from html import escape

root = Path(__file__).resolve().parent.parent
artifact = root / 'artifacts'
screens = [
    ('Homepage', 'TaskJuvo-homepage.png'),
    ('Business overview', 'TaskJuvo-overview.png'),
    ('Task wizard', 'TaskJuvo-task-wizard.png'),
    ('Curated matches', 'TaskJuvo-matches.png'),
    ('Talent profile', 'TaskJuvo-profile.png'),
    ('Project confirmation', 'TaskJuvo-confirmation.png'),
    ('Project workspace', 'TaskJuvo-workspace.png'),
    ('For talent', 'TaskJuvo-talent.png'),
    ('Expert feedback', 'TaskJuvo-feedback.png'),
]
cards = ''.join(f'<a class="card" href="{escape(filename)}"><img src="{escape(filename)}" alt="{escape(title)} screen"><strong>{escape(title)}</strong><span>Open full screen →</span></a>' for title, filename in screens)
html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TaskJuvo · Screen gallery</title>
<style>
:root {{ color-scheme: light; --navy:#17243b; --orange:#b84325; --muted:#697587; --line:#e4e7ec; --canvas:#f7f8fa; }}
* {{ box-sizing:border-box; }} body {{ margin:0; background:var(--canvas); color:var(--navy); font:15px/1.6 Inter,ui-sans-serif,system-ui,sans-serif; }} main {{ max-width:1280px; margin:auto; padding:56px 32px 80px; }} header {{ display:flex; justify-content:space-between; gap:24px; align-items:end; margin-bottom:34px; }} h1 {{ margin:6px 0 10px; font-size:clamp(30px,4vw,48px); line-height:1.1; letter-spacing:-.05em; }} p {{ color:var(--muted); max-width:670px; }} .eyebrow {{ text-transform:uppercase; letter-spacing:.13em; font-size:11px; font-weight:700; color:var(--orange); }} .note {{ padding:16px 19px; border:1px solid #ebdccd; border-radius:10px; background:#fcf4ec; color:#705c50; font-size:13px; }} .grid {{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; }} .card {{ display:flex; flex-direction:column; gap:7px; overflow:hidden; background:white; border:1px solid var(--line); border-radius:12px; color:inherit; text-decoration:none; box-shadow:0 2px 8px #17243b06; }} .card:hover {{ border-color:#d19a82; transform:translateY(-2px); transition:.15s; }} .card img {{ width:100%; height:190px; object-fit:cover; object-position:top; border-bottom:1px solid var(--line); }} .card strong,.card span {{ padding:0 18px; }} .card strong {{ padding-top:10px; font-size:16px; }} .card span {{ padding-bottom:17px; color:var(--orange); font-size:12px; }} footer {{ margin-top:34px; padding-top:20px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; }} @media(max-width:900px) {{ .grid {{ grid-template-columns:repeat(2,minmax(0,1fr)); }} header {{ display:block; }} }} @media(max-width:570px) {{ main {{ padding:35px 18px 55px; }} .grid {{ grid-template-columns:1fr; }} .card img {{ height:205px; }} }}
</style></head><body><main><header><div><span class="eyebrow">TaskJuvo · Prototype review</span><h1>One idea. A complete experience.</h1><p>Browse the main TaskJuvo screens captured from the tested English prototype. Select any screen to view the full-size capture.</p></div></header><p class="note">All people, projects, scores and examples are fictional. The prototype has no live matching, payments, accounts or messaging.</p><section class="grid" aria-label="TaskJuvo prototype screens">{cards}</section><footer>Built for expert feedback · TaskJuvo English prototype · {len(screens)} screens</footer></main></body></html>'''
(artifact / 'TaskJuvo-gallery.html').write_text(html, encoding='utf-8')
print('Created TaskJuvo-gallery.html')
