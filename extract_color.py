from PIL import Image
from collections import Counter

img = Image.open('src/assets/logo.png').convert('RGBA')
pixels = img.getdata()
valid_pixels = []
for p in pixels:
    # Filter transparent, white, and near-black
    if p[3] > 10 and not (p[0] > 240 and p[1] > 240 and p[2] > 240) and not (p[0] < 30 and p[1] < 30 and p[2] < 30):
        valid_pixels.append((p[0], p[1], p[2]))

most_common = Counter(valid_pixels).most_common(10)
print("Top colors found in logo:")
for c, count in most_common:
    print(f"#{c[0]:02x}{c[1]:02x}{c[2]:02x} - rgb{c} - count:{count}")
