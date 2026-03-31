import sys
from PIL import Image

def remove_hashed_lines(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # The background grid lines are light gray/blue against a white background.
        # If the pixel is close to white or is a light gray line, we can just make it fully transparent (or white).
        # We will make the background fully transparent!
        # Orange/Blue logo colors:
        # Orange: high red/green, low blue.
        # Blue: low red/green, high blue.
        # Grid lines: typically something like (220, 230, 240) to (245, 245, 245) or so.
        # Pure white: (255, 255, 255)
        
        # Let's preserve the main colors.
        # If a pixel has high luminance and low saturation, it's part of the background/grid.
        # Luminance approx: 0.299*R + 0.587*G + 0.114*B
        # Actually a simpler check: If all R, G, B are > 215, it's very light (either white background or light grid)
        if r > 215 and g > 215 and b > 215:
            new_data.append((255, 255, 255, 0)) # transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_hashed_lines(sys.argv[1], sys.argv[2])
