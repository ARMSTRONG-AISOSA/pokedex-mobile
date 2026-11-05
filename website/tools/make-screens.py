"""Turns raw device screenshots into the website's screenshots.

    python3 website/tools/make-screens.py RAW_DIR [--top 33] [--bottom 1220]

RAW_DIR holds full-screen PNGs named after the outputs (list-light.png, detail-light.png,
evolution-light.png, team-light.png, sheet-light.png, list-dark.png, detail-dark.png,
detail-charizard-dark.png). Each is cropped to the app area (no Android status or
navigation bar; the defaults suit the Maxwest tablet, 800×1280) and saved as lossless
WebP at full resolution in website/assets/screens/. Lossless keeps small app text sharp,
and flat UI screens stay around 100 KB each.
"""
import argparse
import pathlib

from PIL import Image

OUT = pathlib.Path('website/assets/screens')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('raw_dir', type=pathlib.Path)
    parser.add_argument('--top', type=int, default=33, help='first row below the status bar')
    parser.add_argument('--bottom', type=int, default=1220, help='first row of the navigation bar')
    args = parser.parse_args()

    for src in sorted(args.raw_dir.glob('*.png')):
        im = Image.open(src).convert('RGB')
        im = im.crop((0, args.top, im.width, args.bottom))
        dest = OUT / (src.stem + '.webp')
        im.save(dest, 'WEBP', lossless=True, quality=100, method=6)
        print(f'{dest}  {im.width}×{im.height}  {dest.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
