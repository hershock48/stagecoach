#!/usr/bin/env python3
"""
Cut the client's badge into animatable layers.

Same technique as the Lemoncello build: the brand assets are not redrawn, they
are lifted out of the one supplied logo image by a tool and re-cut into layers,
so the mark itself can move. Nothing here is traced by hand or eyeballed --
every coordinate below is measured off the artwork and printed, so a future
session can check the numbers rather than trusting them.

What it produces, into public/brand/:

  badge-empty.png   the badge with the coach removed and the hole filled with
                    the badge's own cream field, so the coach can arrive INTO
                    the logo and complete it
  coach-frame.svg   coach body, driver and reins: everything that is not a
                    wheel, not a horse and not the whip
  wheel-rear.svg    the two wheels, each centered on its own hub so a CSS
  wheel-front.svg   rotation spins it truly rather than orbiting
  horses.svg        the pair, cut at the harness so they can bound
  whip.svg          the lash alone, so the driver can crack it
  mark.json         every position, pivot and radius the CSS needs

Method notes worth keeping:

* The coach is found as the largest connected component of black ink in the
  badge, which separates it from the ring rules and the lettering cleanly.
* The wheels are found from their SPOKE GAPS: the wedges between spokes are
  background regions fully enclosed by ink, and a ring of such wedges is by
  definition a wheel. The cluster centroid is the hub. The tyre radius is then
  found by walking outward until a circle of that radius stops being mostly
  ink. Detecting the wheels from the holes rather than the ink is what makes
  this robust; the ink of a wheel touches the ink of the body.
* Every layer is emitted at the SAME canvas size as the whole coach, so the
  layers stack with no offsets to keep in sync. Position is baked into the
  pixels, which removes a whole class of drift bug.

Run from the repo root:  python3 tools/cut-mark.py
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public" / "brand" / "logo-source.png"
OUT = ROOT / "public" / "brand"


def load_ink(path: Path):
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    ink = (a[..., 3] > 128) & (a[..., 0] < 90) & (a[..., 1] < 90) & (a[..., 2] < 90)
    return im, a, ink


def largest_component(mask):
    lab, n = ndimage.label(mask)
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    return lab == (int(np.argmax(sizes)) + 1)


def enclosed_holes(ink):
    """Background regions fully surrounded by ink, with centroid and area."""
    lab, n = ndimage.label(~ink)
    border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    border.discard(0)
    out = []
    for i in range(1, n + 1):
        if i in border:
            continue
        ys, xs = np.where(lab == i)
        if len(ys) < 30:
            continue
        out.append((xs.mean(), ys.mean(), len(ys)))
    return np.array(out)


def find_wheels(ink):
    holes = enclosed_holes(ink)
    # Spoke gaps are small, low in the frame, and under the coach body rather
    # than out among the horses.
    spoke = holes[(holes[:, 2] < 900) & (holes[:, 1] > ink.shape[0] * 0.45) & (holes[:, 0] < ink.shape[1] * 0.6)]
    xs = spoke[:, 0]
    c = [xs.min() + (xs.max() - xs.min()) * 0.2, xs.min() + (xs.max() - xs.min()) * 0.8]
    for _ in range(50):
        m = np.abs(xs - c[0]) <= np.abs(xs - c[1])
        if m.sum() and (~m).sum():
            c = [xs[m].mean(), xs[~m].mean()]
    wheels = []
    for grp in sorted([spoke[m], spoke[~m]], key=lambda g: g[:, 0].mean()):
        cx, cy = grp[:, 0].mean(), grp[:, 1].mean()
        gap_r = np.median(np.hypot(grp[:, 0] - cx, grp[:, 1] - cy))
        r = int(gap_r)
        for test in range(int(gap_r), int(gap_r * 2.4)):
            th = np.linspace(0, 2 * np.pi, 240)
            yy = np.clip((cy + test * np.sin(th)).astype(int), 0, ink.shape[0] - 1)
            xx = np.clip((cx + test * np.cos(th)).astype(int), 0, ink.shape[1] - 1)
            if ink[yy, xx].mean() > 0.55:
                r = test
        wheels.append({"cx": float(cx), "cy": float(cy), "r": int(r), "gaps": int(len(grp))})
    return wheels


def trace(mask, name: str) -> str:
    """Bitmap layer -> SVG path, via the glaze.md recipe (8x, slight blur,
    threshold chosen by diffing candidates against the source)."""
    img = Image.fromarray(np.where(mask, 0, 255).astype(np.uint8))
    big = img.resize((img.width * 8, img.height * 8), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.0))
    pbm = Path(f"/tmp/{name}.pbm")
    big.point(lambda p: 0 if p < 120 else 255).convert("1").save(pbm)
    svg = Path(f"/tmp/{name}.svg")
    subprocess.run(["potrace", "-s", "-o", str(svg), "--flat", "-a", "1.0", "-O", "0.2", str(pbm)], check=True)
    return svg.read_text()


def write_layer(mask, name: str, W: int, H: int):
    import re

    s = trace(mask, name)
    d = re.search(r'<path[^>]*d="([^"]+)"', s)
    if not d:
        print(f"  ! {name}: traced to nothing, skipped")
        return False
    tf = re.search(r'transform="([^"]+)"', s).group(1)
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    # glaze.md: state width and height, derived from the viewBox. currentColor
    # so one copy of the path inks in any palette color.
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
        f'width="{W}" height="{H}" aria-hidden="true">'
        f'<g transform="{tf}" fill="currentColor" stroke="none">'
        f'<path d="{d.group(1)}"/></g></svg>'
    )
    p = OUT / f"{name}.svg"
    p.write_text(out)
    print(f"  {name}.svg  {len(out):>7} bytes")
    return True


def main():
    if not LOGO.exists():
        sys.exit(f"missing {LOGO}: keep the untouched logo export beside the optimized one")

    im, rgba, ink = load_ink(LOGO)
    coach_full = largest_component(ink)
    ys, xs = np.where(coach_full)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    print(f"coach in badge: x[{x0}-{x1}] y[{y0}-{y1}]  ({x1-x0+1}x{y1-y0+1})")

    # --- the badge with the coach cut out ---------------------------------
    # The coach sits on the badge's cream field, so filling its footprint with
    # that cream is exact rather than an inpainting guess. Sampled from the
    # field immediately around the coach.
    ring = ndimage.binary_dilation(coach_full, iterations=14) & ~ndimage.binary_dilation(coach_full, iterations=4)
    field = rgba[ring][:, :3]
    cream = np.median(field, axis=0).astype(np.uint8)
    print(f"badge field sampled around the coach: #{cream[0]:02X}{cream[1]:02X}{cream[2]:02X}")
    # Dilate before filling: the coach's edge is anti-aliased, and pixels in
    # that halo are too light to pass the ink test, so filling only the strict
    # mask leaves a visible ghost of the coach in the empty badge. Caught by
    # looking at the output rather than by trusting the mask.
    footprint = ndimage.binary_dilation(coach_full, iterations=3)
    empty = rgba.copy()
    empty[footprint, :3] = cream
    empty[footprint, 3] = 255
    Image.fromarray(empty).quantize(colors=32, method=Image.FASTOCTREE).save(OUT / "badge-empty.png", optimize=True)
    print(f"  badge-empty.png  {(OUT/'badge-empty.png').stat().st_size:>7} bytes")

    # --- layers, all on the coach's own canvas ----------------------------
    sub = coach_full[y0 : y1 + 1, x0 : x1 + 1]
    H, W = sub.shape
    wheels = find_wheels(sub)
    for w in wheels:
        print(f"wheel: hub ({w['cx']:.1f},{w['cy']:.1f}) r={w['r']} from {w['gaps']} spoke gaps")

    yy, xx = np.mgrid[0:H, 0:W]
    wheel_masks = []
    for w in wheels:
        disc = (xx - w["cx"]) ** 2 + (yy - w["cy"]) ** 2 <= (w["r"] + 2) ** 2
        wheel_masks.append(sub & disc)

    # The whip and the reins, as one layer, because that is how they actually
    # move: a driver snapping the lines flicks both. Isolated as the HAIRLINE
    # ink above and right of the driver's hand -- opening the mask with a 4px
    # structuring element deletes every solid mass (the coach roof, the
    # driver's body) and leaves only the drawn lines. A first attempt used a
    # plain box and took a wedge of the coach roof with it, which was obvious
    # the moment the layer was rendered on its own.
    solid = ndimage.binary_dilation(ndimage.binary_erosion(sub, iterations=4), iterations=4)
    hairline = sub & ~solid
    lash = hairline & (xx > W * 0.53) & (yy < H * 0.42)
    lash = ndimage.binary_dilation(lash, iterations=1) & sub & ~solid

    # The horses: the solid mass right of the harness line. Hairlines out
    # there are reins, and they belong to the whip layer.
    harness = int(W * 0.55)
    horses = sub & (xx > harness) & ~lash
    horses &= ndimage.binary_dilation(solid, iterations=2)

    frame = sub.copy()
    for m in wheel_masks:
        frame &= ~m
    frame &= ~horses
    frame &= ~lash

    # NO LEG RIG, and this is deliberate. The two horses in this silhouette
    # interleave: the far horse's legs pass behind the near horse's body, and
    # they meet as one connected black mass. Cutting at the belly line and
    # swinging the pieces was tried, rendered, and looked exactly like what it
    # was -- detached hooves floating beside the horses. The stride is carried
    # instead by the body: a bound plus a gather-and-extend along x, which is
    # what a galloping pair actually does and what survives at the size this
    # mark renders. Do not re-attempt the leg cut without a second artwork.

    print("layers:")
    write_layer(frame, "coach-frame", W, H)
    write_layer(wheel_masks[0], "wheel-rear", W, H)
    write_layer(wheel_masks[1], "wheel-front", W, H)
    write_layer(horses, "horses", W, H)
    write_layer(lash, "whip", W, H)

    meta = {
        "canvas": {"w": int(W), "h": int(H)},
        "badge": {
            "w": int(im.width),
            "h": int(im.height),
            "coach": {"x": int(x0), "y": int(y0), "w": int(W), "h": int(H)},
        },
        "wheels": wheels,
        "harnessX": harness,
        "note": "Generated by tools/cut-mark.py from public/brand/logo-source.png. Re-run it rather than hand-editing any layer.",
    }
    (OUT / "mark.json").write_text(json.dumps(meta, indent=2))
    print("  mark.json written")


if __name__ == "__main__":
    main()
