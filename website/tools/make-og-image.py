"""Builds website/assets/og-image.png (1200x630), the preview shown when the site link is shared.

Run from the repository root after replacing the screenshots:
    python3 website/tools/make-og-image.py
Needs Pillow, and node_modules installed (it uses the app's own font files).
"""
from PIL import Image, ImageDraw, ImageFont

FONTS = 'node_modules/@expo-google-fonts/'
ASSETS = 'website/assets/'
W, H = 1200, 630
BRAND_BG = (19, 34, 43)  # #13222b, the app's launch screen


def ball(draw, cx, cy, r):
    draw.pieslice((cx - r, cy - r, cx + r, cy + r), 180, 360, fill=(232, 69, 60))
    draw.pieslice((cx - r, cy - r, cx + r, cy + r), 0, 180, fill=(244, 247, 246))
    draw.rectangle((cx - r, cy - r * 0.087, cx + r, cy + r * 0.087), fill=(11, 20, 23))
    br = r * 0.30
    draw.ellipse((cx - br, cy - br, cx + br, cy + br), fill=(244, 247, 246), outline=(11, 20, 23), width=max(2, int(r * 0.13)))


def phone(img, path, x, y, width, angle):
    shot = Image.open(path).convert('RGB')
    height = int(width * shot.height / shot.width)
    shot = shot.resize((width, height), Image.LANCZOS)
    pad = 10
    frame = Image.new('RGBA', (width + 2 * pad, height + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(frame).rounded_rectangle((0, 0, width + 2 * pad - 1, height + 2 * pad - 1), radius=34, fill=(8, 14, 17, 255))
    mask = Image.new('L', (width, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width - 1, height - 1), radius=26, fill=255)
    frame.paste(shot, (pad, pad), mask)
    frame = frame.rotate(angle, resample=Image.BICUBIC, expand=True)
    img.paste(frame, (x, y), frame)


def main():
    img = Image.new('RGB', (W, H), BRAND_BG)
    draw = ImageDraw.Draw(img)

    glow = Image.new('L', (W, H), 0)
    g = ImageDraw.Draw(glow)
    for i in range(60, 0, -1):
        g.ellipse((900 - i * 6, 330 - i * 6, 900 + i * 6, 330 + i * 6), fill=int(70 * (1 - i / 60)))
    img.paste((60, 90, 104), (0, 0), glow)

    ball(draw, 110, 140, 46)
    big = ImageFont.truetype(FONTS + 'bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf', 104)
    mid = ImageFont.truetype(FONTS + 'figtree/500Medium/Figtree_500Medium.ttf', 34)
    pill = ImageFont.truetype(FONTS + 'figtree/600SemiBold/Figtree_600SemiBold.ttf', 24)
    draw.text((64, 215), 'Dexplorer', font=big, fill=(255, 255, 255))
    draw.text((68, 350), 'Every Pokémon, even offline.', font=mid, fill=(232, 241, 240))
    draw.text((68, 398), 'A free Pokédex app for Android.', font=mid, fill=(148, 167, 172))
    draw.rounded_rectangle((68, 480, 368, 532), radius=26, fill=(232, 69, 60))
    draw.text((96, 491), 'Download the APK', font=pill, fill=(255, 255, 255))

    phone(img, ASSETS + 'screens/list-light.webp', 700, 120, 250, 6)
    phone(img, ASSETS + 'screens/detail-dark.webp', 900, 70, 250, -4)
    img.save(ASSETS + 'og-image.png', optimize=True)


if __name__ == '__main__':
    main()
