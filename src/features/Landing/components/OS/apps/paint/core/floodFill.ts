/**
 * Flood-fill algorithm with anti-alias fringe blending.
 *
 * Phase 1 – standard stack-based flood fill (tolerance 32).
 * Phase 2 – fringe pass: unfilled pixels that border a filled pixel
 *           get alpha-blended toward the fill color proportionally to
 *           how close they are to the original target color. This
 *           eliminates the visible seam between a filled area and
 *           anti-aliased line edges.
 */

/* ── helpers ──────────────────────────────────── */

function colorMatch(
  data: Uint8ClampedArray,
  idx: number,
  r: number,
  g: number,
  b: number,
  a: number,
  tolerance: number,
): boolean {
  return (
    Math.abs(data[idx]! - r) <= tolerance &&
    Math.abs(data[idx + 1]! - g) <= tolerance &&
    Math.abs(data[idx + 2]! - b) <= tolerance &&
    Math.abs(data[idx + 3]! - a) <= tolerance
  );
}

function setPixel(
  data: Uint8ClampedArray,
  idx: number,
  r: number,
  g: number,
  b: number,
  a: number,
): void {
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function hexToRgba(hex: string): [number, number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
    255,
  ];
}

/** Per-channel max distance between a pixel and a reference color. */
function maxChannelDiff(
  data: Uint8ClampedArray,
  idx: number,
  r: number,
  g: number,
  b: number,
  a: number,
): number {
  return Math.max(
    Math.abs(data[idx]! - r),
    Math.abs(data[idx + 1]! - g),
    Math.abs(data[idx + 2]! - b),
    Math.abs(data[idx + 3]! - a),
  );
}

/* ── main export ──────────────────────────────── */

/**
 * Flood fill starting at (startX, startY) with the given hex color.
 *
 * @param tolerance  – how close a pixel must be to the target color to
 *                     be filled (per-channel). Default 32.
 * @param fringeTolerance – extended range for anti-alias blending on
 *                     boundary pixels. Default 96.
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillHex: string,
  tolerance = 32,
  fringeTolerance = 96,
): void {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const sx = Math.round(startX);
  const sy = Math.round(startY);
  if (sx < 0 || sx >= width || sy < 0 || sy >= height) return;

  const startIdx = (sy * width + sx) * 4;
  const sr = data[startIdx] ?? 0;
  const sg = data[startIdx + 1] ?? 0;
  const sb = data[startIdx + 2] ?? 0;
  const sa = data[startIdx + 3] ?? 0;

  const [fr, fg, fb, fa] = hexToRgba(fillHex);

  // Don't fill if the target color is the same as the fill color
  if (
    Math.abs(sr - fr) <= tolerance &&
    Math.abs(sg - fg) <= tolerance &&
    Math.abs(sb - fb) <= tolerance &&
    Math.abs(sa - fa) <= tolerance
  ) {
    return;
  }

  /* ── Phase 1: standard flood fill ────────────── */
  const stack: [number, number][] = [[sx, sy]];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const pixelIdx = y * width + x;

    if (visited[pixelIdx]) continue;

    const idx = pixelIdx * 4;
    if (!colorMatch(data, idx, sr, sg, sb, sa, tolerance)) continue;

    visited[pixelIdx] = 1;
    setPixel(data, idx, fr, fg, fb, fa);

    if (x > 0) stack.push([x - 1, y]);
    if (x < width - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < height - 1) stack.push([x, y + 1]);
  }

  /* ── Phase 2: anti-alias fringe blending ─────── */
  // For every unfilled pixel that has at least one filled neighbour,
  // blend the fill color in proportion to how much it resembles the
  // original target color.  This removes the visible seam between the
  // filled area and anti-aliased line edges.
  const total = width * height;
  for (let pi = 0; pi < total; pi++) {
    if (visited[pi]) continue; // already filled

    const x = pi % width;
    const y = (pi - x) / width;

    // Check 4-connected neighbours for a filled pixel
    const hasFilled =
      (x > 0 && visited[pi - 1]) ||
      (x < width - 1 && visited[pi + 1]) ||
      (y > 0 && visited[pi - width]) ||
      (y < height - 1 && visited[pi + width]);

    if (!hasFilled) continue;

    const idx = pi * 4;
    const diff = maxChannelDiff(data, idx, sr, sg, sb, sa);

    if (diff <= fringeTolerance) {
      // blend ∈ [1 … 0] – closer to original ⇒ stronger fill
      const blend = 1 - diff / fringeTolerance;
      data[idx]     = Math.round(data[idx]!     * (1 - blend) + fr * blend);
      data[idx + 1] = Math.round(data[idx + 1]! * (1 - blend) + fg * blend);
      data[idx + 2] = Math.round(data[idx + 2]! * (1 - blend) + fb * blend);
      data[idx + 3] = Math.round(data[idx + 3]! * (1 - blend) + fa * blend);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
