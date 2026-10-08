"""Create a compact contact sheet from the captured screen previews."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
artifact = root / 'artifacts'
names = ['homepage', 'overview', 'task-wizard', 'matches', 'profile', 'confirmation', 'workspace', 'talent', 'feedback']
thumb_width, thumb_height, gap, label_height = 420, 250, 18, 42
columns = 3
rows = (len(names) + columns - 1) // columns
sheet = Image.new('RGB', (columns * thumb_width + (columns + 1) * gap, rows * (thumb_height + label_height + gap) + gap), '#f7f8fa')
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
except OSError:
    font = ImageFont.load_default()
for index, name in enumerate(names):
    source = artifact / f'TaskJuvo-{name}.png'
    image = Image.open(source).convert('RGB')
    image.thumbnail((thumb_width, thumb_height))
    x = gap + (index % columns) * (thumb_width + gap)
    y = gap + (index // columns) * (thumb_height + label_height + gap)
    tile = Image.new('RGB', (thumb_width, thumb_height), 'white')
    tile.paste(image, ((thumb_width - image.width) // 2, 0))
    sheet.paste(tile, (x, y))
    label = name.replace('-', ' ').title()
    draw.text((x, y + thumb_height + 10), label, fill='#17243b', font=font)
sheet.save(artifact / 'TaskJuvo-pages.png', optimize=True)
print('Created TaskJuvo-pages.png')
