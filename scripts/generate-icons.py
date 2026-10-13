from PIL import Image, ImageDraw, ImageFont
import os

def create_base_icon(size=512, maskable=False):
    # Create RGBA canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = size / 512.0
    corner_radius = int(112 * scale) if not maskable else 0

    # Background
    bg_color = (37, 99, 235, 255) # #2563EB
    if maskable:
        # Full bleed square for maskable icon
        draw.rectangle([0, 0, size, size], fill=bg_color)
    else:
        # Rounded squircle
        draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=bg_color)

    # Document coordinates
    # On 512x512: doc is 240 wide, 320 high.
    # For maskable, safe zone is inner 80%, so scale doc slightly down if maskable
    doc_scale = 0.8 if maskable else 1.0
    doc_w = int(240 * scale * doc_scale)
    doc_h = int(320 * scale * doc_scale)
    doc_x0 = int((size - doc_w) / 2)
    doc_y0 = int((size - doc_h) / 2)
    doc_x1 = doc_x0 + doc_w
    doc_y1 = doc_y0 + doc_h
    fold_size = int(72 * scale * doc_scale)

    # Shadow under document
    shadow_offset = int(8 * scale)
    draw.rounded_rectangle(
        [doc_x0, doc_y0 + shadow_offset, doc_x1, doc_y1 + shadow_offset],
        radius=int(20 * scale * doc_scale),
        fill=(15, 23, 42, 60)
    )

    # Document main polygon with cut corner at top right
    doc_poly = [
        (doc_x0, doc_y0),
        (doc_x1 - fold_size, doc_y0),
        (doc_x1, doc_y0 + fold_size),
        (doc_x1, doc_y1),
        (doc_x0, doc_y1),
    ]
    draw.polygon(doc_poly, fill=(255, 255, 255, 255))

    # Fold flap in top right
    flap_poly = [
        (doc_x1 - fold_size, doc_y0),
        (doc_x1 - fold_size, doc_y0 + fold_size),
        (doc_x1, doc_y0 + fold_size)
    ]
    draw.polygon(flap_poly, fill=(219, 234, 254, 255)) # #DBEAFE
    # Flap border line
    draw.line([(doc_x1 - fold_size, doc_y0), (doc_x1 - fold_size, doc_y0 + fold_size), (doc_x1, doc_y0 + fold_size)], fill=(147, 197, 253, 255), width=int(2*scale))

    # PDF badge
    badge_w = int(160 * scale * doc_scale)
    badge_h = int(48 * scale * doc_scale)
    badge_x0 = int(doc_x0 + (doc_w - badge_w) / 2)
    badge_y0 = int(doc_y0 + 120 * scale * doc_scale)
    badge_x1 = badge_x0 + badge_w
    badge_y1 = badge_y0 + badge_h
    draw.rounded_rectangle([badge_x0, badge_y0, badge_x1, badge_y1], radius=int(8*scale*doc_scale), fill=bg_color)

    # Text "PDF" inside badge
    font_size = int(28 * scale * doc_scale)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    # Draw centered text
    bbox = draw.textbbox((0, 0), "PDF", font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = badge_x0 + (badge_w - text_w) / 2
    text_y = badge_y0 + (badge_h - text_h) / 2 - (bbox[1] if hasattr(bbox, '__getitem__') else 0)
    draw.text((text_x, text_y), "PDF", font=font, fill=(255, 255, 255, 255))

    # Accent decorative lines
    line_x0 = badge_x0
    line_w = badge_w
    line_h = max(2, int(10 * scale * doc_scale))
    y_lines = [
        int(doc_y0 + 195 * scale * doc_scale),
        int(doc_y0 + 225 * scale * doc_scale),
        int(doc_y0 + 255 * scale * doc_scale)
    ]
    widths = [line_w, int(line_w * 0.7), int(line_w * 0.85)]
    colors = [(147, 197, 253, 255), (191, 219, 254, 255), (219, 234, 254, 255)]

    for y, w, col in zip(y_lines, widths, colors):
        draw.rounded_rectangle([line_x0, y, line_x0 + w, y + line_h], radius=line_h // 2, fill=col)

    return img

public_dir = "/config/Desktop/BuildWithGemini/public"

# Generate 512x512
icon_512 = create_base_icon(512, maskable=False)
icon_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")

# Generate 512x512 maskable
icon_maskable = create_base_icon(512, maskable=True)
icon_maskable.save(os.path.join(public_dir, "icon-maskable-512.png"), "PNG")

# Generate 192x192
icon_192 = icon_512.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

# Generate 180x180 (Apple touch icon)
apple_180 = icon_512.resize((180, 180), Image.Resampling.LANCZOS)
apple_180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

# Generate 32x32
fav_32 = icon_512.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save(os.path.join(public_dir, "favicon-32x32.png"), "PNG")

# Generate 16x16
fav_16 = icon_512.resize((16, 16), Image.Resampling.LANCZOS)
fav_16.save(os.path.join(public_dir, "favicon-16x16.png"), "PNG")

# Generate favicon.ico containing 16, 32, 48
fav_48 = icon_512.resize((48, 48), Image.Resampling.LANCZOS)
fav_48.save(
    os.path.join(public_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

print("Successfully generated all favicon and PWA icons in", public_dir)
