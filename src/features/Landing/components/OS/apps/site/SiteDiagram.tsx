import React from "react";

/* ══════════════════════════════════════════════════════════
   Architecture diagram for About This Site.

   Mini Win95 windows for the React app, the WebGL stage, and the DOM
   interfaces plus the shared content model, connected by arrows. Pure SVG
   through the w95 tokens, and scales with the window width.
   ══════════════════════════════════════════════════════════ */

/** A mini window: bevelled face, navy title strip, body lines. */
const Win: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
}> = ({ x, y, w, h, title, lines }) => (
  <g>
    <rect className="dg-face" x={x} y={y} width={w} height={h} />
    <path
      className="dg-hi"
      d={`M ${x + 1.5} ${y + h - 1.5} L ${x + 1.5} ${y + 1.5} L ${x + w - 1.5} ${y + 1.5}`}
    />
    <rect className="dg-title" x={x + 3} y={y + 3} width={w - 6} height={15} />
    <text className="dg-title-text" x={x + 9} y={y + 14.5}>
      {title}
    </text>
    {lines.map((line, i) => (
      <text className="dg-line" key={line} x={x + 9} y={y + 33 + i * 13.5}>
        {line}
      </text>
    ))}
  </g>
);

export const SiteDiagram: React.FC = () => (
  <svg
    className="site-diagram"
    viewBox="0 0 560 258"
    role="img"
    aria-label="Architecture diagram: one React application connects the 3D office to accessible desktop and mobile browser interfaces fed by one shared content model."
  >
    {/* React application */}
    <Win
      x={170}
      y={4}
      w={220}
      h={40}
      title="React application"
      lines={["one page, rendered client-side"]}
    />

    {/* Connectors: app → both surfaces */}
    <path
      className="dg-wire"
      d="M 280 44 V 64 H 129 V 84 M 280 64 H 431 V 84"
    />
    <polygon className="dg-arrow" points="129,92 125.5,84 132.5,84" />
    <polygon className="dg-arrow" points="431,92 427.5,84 434.5,84" />

    {/* 3D stage */}
    <Win
      x={14}
      y={92}
      w={230}
      h={88}
      title="3D stage · WebGL"
      lines={[
        "star loader + 3D office",
        "demand renderer · frozen shadows",
        "direct CRT scene · stable tiers",
      ]}
    />

    {/* Accessible browser interfaces */}
    <Win
      x={316}
      y={92}
      w={230}
      h={88}
      title="Browser interfaces · DOM"
      lines={[
        "desktop window manager",
        "mobile-native phone apps",
        "real text · links · focus",
      ]}
    />

    {/* Office ⇄ OS transitions */}
    <path className="dg-wire" d="M 248 126 H 304" />
    <polygon className="dg-arrow" points="312,126 304,122.5 304,129.5" />
    <text className="dg-note" x={280} y={118} textAnchor="middle">
      monitor
    </text>
    <path className="dg-wire" d="M 312 148 H 256" />
    <polygon className="dg-arrow" points="248,148 256,144.5 256,151.5" />
    <text className="dg-note" x={280} y={164} textAnchor="middle">
      Esc · Home
    </text>

    {/* Content model feeding every DOM surface */}
    <path className="dg-wire" d="M 431 214 V 188" />
    <polygon className="dg-arrow" points="431,180 427.5,188 434.5,188" />
    <rect className="dg-well" x={316} y={214} width={230} height={34} />
    <text className="dg-line" x={431} y={229} textAnchor="middle">
      content model (portfolio.ts)
    </text>
    <text className="dg-note" x={431} y={242.5} textAnchor="middle">
      OS · terminal · mobile · metadata
    </text>
  </svg>
);
