"""Draws the Dexplorer "explorer lens" icon (the Poké Ball as a magnifying glass).

Writes the app icons into assets/images/. Run from the repository root:
    python3 scripts/make-icons.py
Shapes are defined on a 100-unit grid, the same as website/assets/favicon.svg.
"""
from PIL import Image, ImageDraw

BG = (19, 34, 43)        # #13222b, launch screen
RED = (232, 69, 60)      # #e8453c
WHITE = (244, 247, 246)  # #f4f7f6
INK = (11, 20, 23)       # #0b1417
OUT = 'assets/images/'

# Lens geometry on a 100-unit grid (before scaling into the adaptive-icon safe zone).
LENS = dict(cx=44, cy=44, r=20, rim=3.5, handle_end=70, handle_w=7.5)


def draw_lens(size, scale, mono=False):
    """Returns an RGBA image of the lens, scaled about the centre by `scale`."""
    ss = size * 2  # supersample for smooth edges
    u = ss / 100

    def p(v):  # 100-unit coordinate -> pixels, scaled about the centre
        return (50 + (v - 50) * scale) * u

    def d(v):  # 100-unit length -> pixels
        return v * scale * u

    im = Image.new('RGBA', (ss, ss), (0, 0, 0, 0))
    g = ImageDraw.Draw(im)
    cx, cy, r, rim = p(LENS['cx']), p(LENS['cy']), d(LENS['r']), d(LENS['rim'])
    w = d(LENS['handle_w'])
    hx0 = p(LENS['cx'] + LENS['r'] * 0.62)
    hx1 = p(LENS['handle_end'])
    fg = (255, 255, 255, 255) if mono else WHITE
    g.line((hx0, hx0, hx1, hx1), fill=fg, width=int(w))
    g.ellipse((hx1 - w / 2, hx1 - w / 2, hx1 + w / 2, hx1 + w / 2), fill=fg)
    if mono:
        # Themed (monochrome) icon: one colour, so draw the lens as outlines.
        g.ellipse((cx - r - rim, cy - r - rim, cx + r + rim, cy + r + rim), fill=fg)
        inner = r - rim * 0.2
        g.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), fill=(0, 0, 0, 0))
        g.rectangle((cx - r, cy - r * 0.09, cx + r, cy + r * 0.09), fill=fg)
        br = r * 0.34
        g.ellipse((cx - br, cy - br, cx + br, cy + br), fill=fg)
        bi = br * 0.5
        g.ellipse((cx - bi, cy - bi, cx + bi, cy + bi), fill=(0, 0, 0, 0))
    else:
        g.ellipse((cx - r - rim, cy - r - rim, cx + r + rim, cy + r + rim), fill=WHITE)
        g.pieslice((cx - r, cy - r, cx + r, cy + r), 180, 360, fill=RED)
        g.pieslice((cx - r, cy - r, cx + r, cy + r), 0, 180, fill=WHITE)
        g.rectangle((cx - r, cy - r * 0.09, cx + r, cy + r * 0.09), fill=INK)
        br = r * 0.32
        g.ellipse((cx - br, cy - br, cx + br, cy + br), fill=WHITE, outline=INK, width=int(r * 0.14))
    return im.resize((size, size), Image.LANCZOS)


def on_background(fg):
    out = Image.new('RGBA', fg.size, BG + (255,))
    out.alpha_composite(fg)
    return out


def main():
    # Android adaptive icon: the launcher shows only the middle 72 of 108 units and
    # masks it (circle, squircle…). 0.80 keeps the handle inside that circle.
    draw_lens(1024, 0.80).save(OUT + 'android-icon-foreground.png')
    draw_lens(1024, 0.80, mono=True).save(OUT + 'android-icon-monochrome.png')
    Image.new('RGBA', (1024, 1024), BG + (255,)).save(OUT + 'android-icon-background.png')
    # Full-bleed icon (Expo Go, stores, older Android): fills more of the square.
    on_background(draw_lens(1024, 1.2)).convert('RGB').save(OUT + 'icon.png')
    # Splash screen mark (drawn on the #13222b splash background) and web favicon.
    draw_lens(512, 1.15).save(OUT + 'splash-icon.png')
    on_background(draw_lens(192, 1.1)).convert('RGB').resize((48, 48), Image.LANCZOS).save(OUT + 'favicon.png')


if __name__ == '__main__':
    main()
