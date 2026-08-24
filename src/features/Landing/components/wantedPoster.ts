// An original bounty-poster texture in the classic "wanted" format - aged
// parchment, blocky serif type, a gritty pixelated portrait, and an absurd
// bounty. A homage every anime fan will recognize, built entirely from our
// own pixels: no licensed artwork anywhere.

import { CanvasTexture, SRGBColorSpace } from "three";

const POSTER_WIDTH = 512;
const POSTER_HEIGHT = 768;

const INK = "#2a1c10";
const PARCHMENT_BASE = "#d3b98a";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function drawParchment(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PARCHMENT_BASE;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Mottled tone variation.
  for (let i = 0; i < 60; i += 1) {
    const x = seededRandom(i) * POSTER_WIDTH;
    const y = seededRandom(i + 100) * POSTER_HEIGHT;
    const radius = 30 + seededRandom(i + 200) * 90;
    const dark = seededRandom(i + 300) > 0.5;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(
      0,
      dark ? "rgba(120, 88, 48, 0.07)" : "rgba(240, 226, 190, 0.09)",
    );
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Coffee-ring style stains.
  for (let i = 0; i < 4; i += 1) {
    const x = 60 + seededRandom(i + 400) * (POSTER_WIDTH - 120);
    const y = 60 + seededRandom(i + 500) * (POSTER_HEIGHT - 120);
    const radius = 18 + seededRandom(i + 600) * 30;
    ctx.strokeStyle = `rgba(110, 74, 36, ${0.05 + seededRandom(i + 650) * 0.05})`;
    ctx.lineWidth = 3 + seededRandom(i + 700) * 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Edge burn / vignette.
  const vignette = ctx.createRadialGradient(
    POSTER_WIDTH / 2,
    POSTER_HEIGHT / 2,
    POSTER_HEIGHT * 0.3,
    POSTER_WIDTH / 2,
    POSTER_HEIGHT / 2,
    POSTER_HEIGHT * 0.68,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(74, 48, 20, 0.4)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
}

function drawGrit(ctx: CanvasRenderingContext2D) {
  // Speckle noise.
  for (let i = 0; i < 900; i += 1) {
    const x = seededRandom(i + 1000) * POSTER_WIDTH;
    const y = seededRandom(i + 2000) * POSTER_HEIGHT;
    const dark = seededRandom(i + 3000) > 0.4;
    ctx.fillStyle = dark
      ? `rgba(50, 32, 14, ${0.04 + seededRandom(i + 4000) * 0.1})`
      : `rgba(245, 232, 200, ${0.05 + seededRandom(i + 4000) * 0.08})`;
    const size = seededRandom(i + 5000) > 0.92 ? 2 : 1;
    ctx.fillRect(x, y, size, size);
  }

  // A few scratches.
  for (let i = 0; i < 7; i += 1) {
    const x = seededRandom(i + 6000) * POSTER_WIDTH;
    const y = seededRandom(i + 7000) * POSTER_HEIGHT;
    const length = 30 + seededRandom(i + 8000) * 80;
    const angle = seededRandom(i + 9000) * Math.PI;
    ctx.strokeStyle = `rgba(58, 38, 16, ${0.07 + seededRandom(i + 9500) * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }
}

/** Shrinks the font size until `text` fits within `maxWidth`. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  startSize: number,
  maxWidth: number,
  family = "Georgia, 'Times New Roman', serif",
  weight = "900",
): number {
  let size = startSize;
  while (size > 10) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function drawPortrait(ctx: CanvasRenderingContext2D, photo: HTMLImageElement) {
  const frameX = 88;
  const frameY = 150;
  const frameWidth = POSTER_WIDTH - frameX * 2;
  const frameHeight = 292;

  // Chunky pixelation: downsample hard, upscale with smoothing off.
  const lowResWidth = 52;
  const lowResHeight = Math.round(
    (lowResWidth * frameHeight) / frameWidth,
  );
  const buffer = document.createElement("canvas");
  buffer.width = lowResWidth;
  buffer.height = lowResHeight;
  const bufferCtx = buffer.getContext("2d");
  if (!bufferCtx) return;

  // Cover-crop the photo into the frame's aspect.
  const frameAspect = frameWidth / frameHeight;
  const photoAspect = photo.width / photo.height;
  let sourceWidth = photo.width;
  let sourceHeight = photo.height;
  if (photoAspect > frameAspect) sourceWidth = photo.height * frameAspect;
  else sourceHeight = photo.width / frameAspect;
  const sourceX = (photo.width - sourceWidth) / 2;
  const sourceY = (photo.height - sourceHeight) * 0.25; // bias toward the face

  bufferCtx.drawImage(
    photo,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    lowResWidth,
    lowResHeight,
  );

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.filter = "grayscale(0.9) sepia(0.6) contrast(1.18) brightness(0.96)";
  ctx.drawImage(buffer, frameX, frameY, frameWidth, frameHeight);
  ctx.restore();

  // Weathering over the portrait so it sits in the paper.
  ctx.fillStyle = "rgba(150, 112, 62, 0.14)";
  ctx.fillRect(frameX, frameY, frameWidth, frameHeight);

  // Frame.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
}

function drawType(ctx: CanvasRenderingContext2D) {
  // Bounty-poster structure: WANTED up top, the portrait, DEAD OR ALIVE
  // beneath it, then the name and the bounty. Every line is measured and
  // shrunk until it fits inside the inner frame with clear margins.
  const maxWidth = POSTER_WIDTH - 124;
  const center = POSTER_WIDTH / 2;

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const wantedSize = fitText(ctx, "WANTED", 92, maxWidth);
  ctx.font = `900 ${wantedSize}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("WANTED", center, 116);

  const deadSize = fitText(
    ctx,
    "• DEAD OR ALIVE •",
    26,
    maxWidth - 40,
    undefined,
    "700",
  );
  ctx.font = `700 ${deadSize}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("• DEAD OR ALIVE •", center, 486);

  const nameSize = fitText(ctx, "SEVAN LEWIS-PAYNE", 42, maxWidth);
  ctx.font = `900 ${nameSize}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("SEVAN LEWIS-PAYNE", center, 552);

  const bountySize = fitText(ctx, "$3,000,000,000-", 54, maxWidth);
  ctx.font = `900 ${bountySize}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("$3,000,000,000-", center, 626);

  // Thin rules framing the bounty line, like a printed notice.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 576);
  ctx.lineTo(POSTER_WIDTH - 72, 576);
  ctx.moveTo(72, 648);
  ctx.lineTo(POSTER_WIDTH - 72, 648);
  ctx.stroke();

  const crimeSize = fitText(
    ctx,
    "WANTED FOR: SHIPPING ON FRIDAYS",
    18,
    maxWidth - 30,
    undefined,
    "700",
  );
  ctx.font = `700 ${crimeSize}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("WANTED FOR: SHIPPING ON FRIDAYS", center, 684);

  ctx.font = "700 14px Georgia, 'Times New Roman', serif";
  ctx.fillText("BOUNTY No. 0007", center, 720);

  // Double border.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.strokeRect(20, 20, POSTER_WIDTH - 40, POSTER_HEIGHT - 40);
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, POSTER_WIDTH - 64, POSTER_HEIGHT - 64);
}

export function createWantedPosterTexture(
  photoUrl: string,
): Promise<CanvasTexture> {
  return new Promise((resolve, reject) => {
    const photo = new Image();
    photo.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = POSTER_WIDTH;
      canvas.height = POSTER_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("2d context unavailable"));
        return;
      }

      // glTF textures sample with flipY = false, which matches the canvas's
      // top-first pixel order directly - draw normally.
      drawParchment(ctx);
      drawPortrait(ctx, photo);
      drawType(ctx);
      drawGrit(ctx);

      const texture = new CanvasTexture(canvas);
      // This mesh's UVs sample with the flipped-Y convention (verified
      // visually) - the canvas default matches it.
      texture.flipY = true;
      texture.colorSpace = SRGBColorSpace;
      resolve(texture);
    };
    photo.onerror = () => reject(new Error("poster photo failed to load"));
    photo.src = photoUrl;
  });
}
