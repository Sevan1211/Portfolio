/**
 * Scanline flood-fill algorithm for the fill-bucket tool.
 * Operates directly on canvas ImageData for performance.
 */

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

/**
 * Parse a hex color string to [r, g, b, a].
 */
function hexToRgba(hex: string): [number, number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
    255,
  ];
}

/**
 * Flood fill starting at (startX, startY) with the given hex color.
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillHex: string,
  tolerance = 10,
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

  ctx.putImageData(imageData, 0, 0);
}
