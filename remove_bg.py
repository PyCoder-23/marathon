from PIL import Image
import glob
import sys
import os

def remove_bg(img_path):
    print(f"Processing {img_path}")
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # Any color close to white
    for item in data:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Crop to bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Resize canvas so all frames are grounded at the bottom
    # We want a standard canvas size, say 512x512
    canvas = Image.new("RGBA", (512, 512), (0,0,0,0))
    # Paste centered horizontally, aligned to bottom vertically
    # Let's say bottom margin 20
    x = (512 - img.width) // 2
    y = 512 - img.height - 20
    canvas.paste(img, (x, y))
    
    # Save back
    canvas.save(img_path, "PNG")
    print(f"Saved {img_path}")

for file in glob.glob("public/tanjiro_running_*.png"):
    remove_bg(file)
