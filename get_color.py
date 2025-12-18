import sys
from PIL import Image
from collections import Counter

try:
    img = Image.open("public/logo-med.png")
    img = img.convert("RGB")
    pixels = list(img.getdata())
    # Filter out white/near-white and black/near-black pixels to find the "color"
    filtered_pixels = [p for p in pixels if not (p[0] > 240 and p[1] > 240 and p[2] > 240) and not (p[0] < 15 and p[1] < 15 and p[2] < 15)]
    
    if not filtered_pixels:
        print("No colored pixels found")
        sys.exit(0)

    most_common = Counter(filtered_pixels).most_common(5)
    print("Most common colors:")
    for color, count in most_common:
        print(f"RGB: {color}, Hex: #{color[0]:02x}{color[1]:02x}{color[2]:02x}, Count: {count}")

except Exception as e:
    print(f"Error: {e}")
