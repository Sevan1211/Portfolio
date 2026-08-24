// Procedural "programming" for the cubicle's Panasonic TV.
// Everything is drawn from code - original test cards, static, and a bouncing
// station logo - so there is nothing to license and nothing to download.
//
// The channel content is drawn at half resolution and upscaled through a
// slight blur/desaturate, then finished with scanlines, noise, a rolling
// tracking band, a vignette, and an overall dim - a consumer tube, not a
// crisp LCD.

const TV_WIDTH = 320;
const TV_HEIGHT = 240;
const CONTENT_WIDTH = 160;
const CONTENT_HEIGHT = 120;

type ChannelId = "bars" | "bounce" | "nosignal";

interface Segment {
  channel: ChannelId;
  durationMs: number;
}

// Rotation of channels, with a burst of static between each - the way
// flipping channels on a 90s set actually looked.
const SCHEDULE: Segment[] = [
  { channel: "bars", durationMs: 14000 },
  { channel: "bounce", durationMs: 22000 },
  { channel: "nosignal", durationMs: 9000 },
];
const STATIC_MS = 850;

const SMPTE_COLORS = [
  "#c0c0c0",
  "#c0c000",
  "#00c0c0",
  "#00c000",
  "#c000c0",
  "#c00000",
  "#0000c0",
];

export interface TvProgram {
  canvas: HTMLCanvasElement;
  /** Draws the frame for `nowMs`; returns true when pixels changed. */
  draw(nowMs: number): boolean;
}

export function createTvProgram(reducedMotion: boolean): TvProgram {
  const canvas = document.createElement("canvas");
  canvas.width = TV_WIDTH;
  canvas.height = TV_HEIGHT;
  const output = canvas.getContext("2d");

  const content = document.createElement("canvas");
  content.width = CONTENT_WIDTH;
  content.height = CONTENT_HEIGHT;
  const contentContext = content.getContext("2d");

  // Pre-rendered overlays: scanlines and vignette never change.
  const scanlines = document.createElement("canvas");
  scanlines.width = TV_WIDTH;
  scanlines.height = TV_HEIGHT;
  {
    const ctx = scanlines.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      for (let y = 0; y < TV_HEIGHT; y += 3) {
        ctx.fillRect(0, y, TV_WIDTH, 1);
      }
    }
  }
  const vignette = document.createElement("canvas");
  vignette.width = TV_WIDTH;
  vignette.height = TV_HEIGHT;
  {
    const ctx = vignette.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(
        TV_WIDTH / 2,
        TV_HEIGHT / 2,
        TV_HEIGHT * 0.42,
        TV_WIDTH / 2,
        TV_HEIGHT / 2,
        TV_WIDTH * 0.72,
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, TV_WIDTH, TV_HEIGHT);
    }
  }

  const totalMs = SCHEDULE.reduce(
    (sum, segment) => sum + segment.durationMs + STATIC_MS,
    0,
  );

  const bouncer = {
    x: 20,
    y: 30,
    velocityX: 23, // px/s in content space
    velocityY: 17,
    hue: 205,
    lastMs: 0,
  };
  let drewReducedFrame = false;

  const drawStatic = (ctx: CanvasRenderingContext2D) => {
    const cell = 2;
    for (let y = 0; y < CONTENT_HEIGHT; y += cell) {
      for (let x = 0; x < CONTENT_WIDTH; x += cell) {
        const value = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgb(${value},${value},${value})`;
        ctx.fillRect(x, y, cell, cell);
      }
    }
  };

  const drawBars = (ctx: CanvasRenderingContext2D, nowMs: number) => {
    const barWidth = CONTENT_WIDTH / SMPTE_COLORS.length;
    const mainHeight = Math.floor(CONTENT_HEIGHT * 0.68);
    SMPTE_COLORS.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.floor(index * barWidth),
        0,
        Math.ceil(barWidth),
        mainHeight,
      );
    });
    const stripHeight = Math.floor(CONTENT_HEIGHT * 0.1);
    SMPTE_COLORS.forEach((_, index) => {
      ctx.fillStyle = SMPTE_COLORS[SMPTE_COLORS.length - 1 - index] ?? "#000";
      ctx.fillRect(
        Math.floor(index * barWidth),
        mainHeight,
        Math.ceil(barWidth),
        stripHeight,
      );
    });
    const panelY = mainHeight + stripHeight;
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, panelY, CONTENT_WIDTH, CONTENT_HEIGHT - panelY);
    ctx.fillStyle = "#e8e8e8";
    ctx.font = "bold 11px monospace";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText("SEVAN TV", 7, panelY + (CONTENT_HEIGHT - panelY) / 2);
    ctx.textAlign = "right";
    ctx.fillText("CH 07", CONTENT_WIDTH - 8, panelY + (CONTENT_HEIGHT - panelY) / 2);
    if (!reducedMotion && Math.floor(nowMs / 700) % 2 === 0) {
      ctx.fillStyle = "#e04040";
      ctx.beginPath();
      ctx.arc(
        CONTENT_WIDTH - 48,
        panelY + (CONTENT_HEIGHT - panelY) / 2,
        3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  };

  const drawBounce = (ctx: CanvasRenderingContext2D, nowMs: number) => {
    const deltaSeconds = bouncer.lastMs
      ? Math.min((nowMs - bouncer.lastMs) / 1000, 0.25)
      : 0;
    bouncer.lastMs = nowMs;

    const boxWidth = 37;
    const boxHeight = 23;
    bouncer.x += bouncer.velocityX * deltaSeconds;
    bouncer.y += bouncer.velocityY * deltaSeconds;
    let bounced = false;
    if (bouncer.x <= 0 || bouncer.x + boxWidth >= CONTENT_WIDTH) {
      bouncer.velocityX *= -1;
      bouncer.x = Math.max(0, Math.min(CONTENT_WIDTH - boxWidth, bouncer.x));
      bounced = true;
    }
    if (bouncer.y <= 0 || bouncer.y + boxHeight >= CONTENT_HEIGHT) {
      bouncer.velocityY *= -1;
      bouncer.y = Math.max(0, Math.min(CONTENT_HEIGHT - boxHeight, bouncer.y));
      bounced = true;
    }
    if (bounced) bouncer.hue = (bouncer.hue + 67) % 360;

    ctx.fillStyle = "#0a1626";
    ctx.fillRect(0, 0, CONTENT_WIDTH, CONTENT_HEIGHT);
    ctx.fillStyle = `hsl(${bouncer.hue}, 70%, 52%)`;
    ctx.fillRect(
      Math.round(bouncer.x),
      Math.round(bouncer.y),
      boxWidth,
      boxHeight,
    );
    ctx.fillStyle = "#f2f2f2";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "7",
      Math.round(bouncer.x + boxWidth / 2),
      Math.round(bouncer.y + boxHeight / 2) + 1,
    );
  };

  const drawNoSignal = (ctx: CanvasRenderingContext2D, nowMs: number) => {
    ctx.fillStyle = "#0000a8";
    ctx.fillRect(0, 0, CONTENT_WIDTH, CONTENT_HEIGHT);
    ctx.fillStyle = "#e8e8e8";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("AV-1", 7, 6);
    const step = Math.floor(nowMs / 2600);
    const driftX = 20 + ((step * 41) % (CONTENT_WIDTH - 90));
    const driftY = 30 + ((step * 23) % (CONTENT_HEIGHT - 60));
    ctx.font = "bold 12px monospace";
    ctx.fillText("NO SIGNAL", driftX, driftY);
  };

  const drawContent = (nowMs: number): boolean => {
    if (!contentContext) return false;
    let cursor = nowMs % totalMs;
    for (const segment of SCHEDULE) {
      if (cursor < segment.durationMs) {
        if (segment.channel === "bars") drawBars(contentContext, nowMs);
        else if (segment.channel === "bounce") drawBounce(contentContext, nowMs);
        else drawNoSignal(contentContext, nowMs);
        return true;
      }
      cursor -= segment.durationMs;
      if (cursor < STATIC_MS) {
        bouncer.lastMs = 0; // reset bounce clock across channel changes
        drawStatic(contentContext);
        return true;
      }
      cursor -= STATIC_MS;
    }
    return false;
  };

  const compose = (nowMs: number, animate: boolean) => {
    if (!output) return;

    // Soft, slightly washed-out picture: half-res content upscaled through
    // a light blur and desaturation.
    output.filter = "saturate(0.72) blur(0.7px)";
    output.imageSmoothingEnabled = true;
    output.drawImage(content, 0, 0, TV_WIDTH, TV_HEIGHT);
    output.filter = "none";

    // Overall dim - a tube never hits full brightness.
    output.fillStyle = "rgba(6, 8, 12, 0.22)";
    output.fillRect(0, 0, TV_WIDTH, TV_HEIGHT);

    if (animate) {
      // Broadcast noise flecks.
      for (let i = 0; i < 130; i++) {
        const x = Math.random() * TV_WIDTH;
        const y = Math.random() * TV_HEIGHT;
        const length = 1 + Math.random() * 5;
        const bright = Math.random() > 0.45;
        output.fillStyle = bright
          ? `rgba(255,255,255,${0.05 + Math.random() * 0.1})`
          : `rgba(0,0,0,${0.06 + Math.random() * 0.12})`;
        output.fillRect(x, y, length, 1);
      }

      // Slow rolling tracking band, VHS style.
      const bandCycle = (nowMs / 24) % (TV_HEIGHT + 90);
      const bandY = bandCycle - 45;
      const band = output.createLinearGradient(0, bandY, 0, bandY + 34);
      band.addColorStop(0, "rgba(255,255,255,0)");
      band.addColorStop(0.45, "rgba(255,255,255,0.06)");
      band.addColorStop(0.55, "rgba(0,0,0,0.1)");
      band.addColorStop(1, "rgba(255,255,255,0)");
      output.fillStyle = band;
      output.fillRect(0, bandY, TV_WIDTH, 34);
    }

    output.drawImage(scanlines, 0, 0);
    output.drawImage(vignette, 0, 0);
  };

  const draw = (nowMs: number): boolean => {
    if (!output || !contentContext) return false;
    if (reducedMotion) {
      if (drewReducedFrame) return false;
      drewReducedFrame = true;
      drawBars(contentContext, 0);
      compose(0, false);
      return true;
    }

    if (!drawContent(nowMs)) return false;
    compose(nowMs, true);
    return true;
  };

  return { canvas, draw };
}
