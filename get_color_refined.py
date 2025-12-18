import sys
from PIL import Image
from collections import Counter

try:
    img = Image.open("public/logo-med.png")
    img = img.convert("RGB")
    pixels = list(img.getdata())
    
    # Filter out grays (where R, G, B are similar) and whites/blacks
    filtered_pixels = []
    for p in pixels:
        r, g, b = p
        if max(r, g, b) - min(r, g, b) < 20: # It's a shade of gray
            continue
        if r > 240 and g > 240 and b > 240: # Too white
            continue
        if r < 15 and g < 15 and b < 15: # Too black
            continue
        filtered_pixels.append(p)

    if not filtered_pixels:
        print("No colored pixels found")
        sys.exit(0)

    most_common = Counter(filtered_pixels).most_common(10)
    print("Most common non-gray colors:")
    for color, count in most_common:
        print(f"RGB: {color}, Hex: #{color[0]:02x}{color[1]:02x}{color[2]:02x}, Count: {count}")

except Exception as e:
    print(f"Error: {e}")
