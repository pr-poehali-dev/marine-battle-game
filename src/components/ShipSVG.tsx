import React from "react";

interface ShipSVGProps {
  size: 1 | 2 | 3 | 4;
  isVertical?: boolean;
  isHit?: boolean;
  isSunk?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Each cell is 40x40 units in SVG space.
// Horizontal ship: viewBox="0 0 {size*40} 40"
// Vertical ship:   viewBox="0 0 40 {size*40}"

const CELL = 40;

// ─── Hull colors ───────────────────────────────────────────────────────────────
const HULL_DARK   = "#0a3870";
const HULL_MID    = "#1a5fa0";
const HULL_LIGHT  = "#2b7cc9";
const DECK_COLOR  = "#c8d8ee";
const STRUCTURE   = "#d0dff0";
const STRUCTURE2  = "#b0c8e8";
const BOW_RED     = "#c0392b";
const BOW_RED2    = "#e74c3c";
const PORTHOLE    = "#0a2a50";
const PORTHOLE_GL = "#5ba3d9";
const STRIPE      = "#ffffff";
const FUNNEL_DARK = "#1a1a2e";
const FUNNEL_MID  = "#2d2d44";
const SMOKE       = "rgba(200,210,230,0.55)";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** A single round porthole centered at (cx, cy) with radius r */
function Porthole({ cx, cy, r = 3.2 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 0.8} fill={PORTHOLE} />
      <circle cx={cx} cy={cy} r={r} fill={PORTHOLE_GL} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="rgba(255,255,255,0.45)" />
    </g>
  );
}

/** A small funnel/chimney centered at (cx, cy) */
function Funnel({ cx, cy, w = 6, h = 7 }: { cx: number; cy: number; w?: number; h?: number }) {
  return (
    <g>
      {/* smoke rings */}
      <ellipse cx={cx} cy={cy - h / 2 - 4} rx={w * 0.55} ry={2.5} fill={SMOKE} />
      <ellipse cx={cx} cy={cy - h / 2 - 7} rx={w * 0.4} ry={1.8} fill={SMOKE} />
      {/* body */}
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={1.5} fill={FUNNEL_DARK} />
      {/* highlight stripe */}
      <rect x={cx - w / 2 + 1.2} y={cy - h / 2 + 1} width={w * 0.25} height={h - 2} rx={0.8} fill={FUNNEL_MID} />
    </g>
  );
}

/** A rectangular superstructure block */
function Bridge({
  x, y, w, h, rx = 2,
}: { x: number; y: number; w: number; h: number; rx?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={STRUCTURE} />
      <rect x={x + 1} y={y + 1} width={w - 2} height={h * 0.45} rx={rx - 0.5} fill={STRUCTURE2} />
      {/* window strip */}
      <rect x={x + 2} y={y + h * 0.55} width={w - 4} height={h * 0.28} rx={1} fill={PORTHOLE} opacity={0.7} />
    </g>
  );
}

// ─── Per-size ship bodies ──────────────────────────────────────────────────────

/**
 * All ship drawings are done in horizontal orientation.
 * The SVG canvas is (size*CELL) wide × CELL tall.
 * For vertical ships we rotate via CSS transform.
 */

function Ship1() {
  // 40×40 canvas
  const W = CELL, H = CELL;
  const hy = H / 2; // horizontal center
  return (
    <g>
      {/* defs */}
      <defs>
        <radialGradient id="hull1" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={HULL_LIGHT} />
          <stop offset="100%" stopColor={HULL_DARK} />
        </radialGradient>
        <radialGradient id="deck1" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={DECK_COLOR} />
          <stop offset="100%" stopColor="#8eaacc" />
        </radialGradient>
      </defs>

      {/* outer hull — pill shape */}
      <rect x={4} y={hy - 13} width={W - 8} height={26} rx={13} fill="url(#hull1)" />

      {/* deck surface */}
      <rect x={8} y={hy - 9} width={W - 16} height={18} rx={9} fill="url(#deck1)" />

      {/* bow red tip */}
      <ellipse cx={W - 8} cy={hy} rx={5} ry={7} fill={BOW_RED} />
      <ellipse cx={W - 7} cy={hy} rx={2.5} ry={4} fill={BOW_RED2} />

      {/* superstructure */}
      <Bridge x={W / 2 - 7} y={hy - 6} w={14} h={12} />

      {/* porthole */}
      <Porthole cx={W / 2 - 9} cy={hy} />

      {/* funnel */}
      <Funnel cx={W / 2 + 5} cy={hy} w={5} h={6} />

      {/* hull waterline stripe */}
      <rect x={5} y={hy + 10} width={W - 14} height={2} rx={1} fill={STRIPE} opacity={0.18} />
    </g>
  );
}

function Ship2() {
  const W = 2 * CELL, H = CELL;
  const hy = H / 2;
  return (
    <g>
      <defs>
        <linearGradient id="hull2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={HULL_MID} />
          <stop offset="50%" stopColor={HULL_LIGHT} />
          <stop offset="100%" stopColor={HULL_DARK} />
        </linearGradient>
        <radialGradient id="deck2" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={DECK_COLOR} />
          <stop offset="100%" stopColor="#7da0c8" />
        </radialGradient>
      </defs>

      {/* outer hull */}
      <rect x={4} y={hy - 14} width={W - 8} height={28} rx={14} fill="url(#hull2)" />

      {/* deck */}
      <rect x={9} y={hy - 10} width={W - 18} height={20} rx={10} fill="url(#deck2)" />

      {/* bow */}
      <ellipse cx={W - 8} cy={hy} rx={6} ry={8} fill={BOW_RED} />
      <ellipse cx={W - 7} cy={hy} rx={3} ry={5} fill={BOW_RED2} />

      {/* stern slight curve */}
      <ellipse cx={8} cy={hy} rx={5} ry={8} fill={HULL_DARK} opacity={0.5} />

      {/* main bridge superstructure */}
      <Bridge x={W / 2 + 2} y={hy - 8} w={22} h={16} rx={3} />

      {/* rear cabin */}
      <Bridge x={W / 2 - 22} y={hy - 6} w={16} h={12} rx={2} />

      {/* funnel */}
      <Funnel cx={W / 2 + 14} cy={hy} w={7} h={8} />

      {/* portholes */}
      <Porthole cx={W / 2 - 10} cy={hy} />
      <Porthole cx={W / 2 + 5} cy={hy} />

      {/* waterline stripe */}
      <rect x={5} y={hy + 11} width={W - 18} height={2} rx={1} fill={STRIPE} opacity={0.2} />
    </g>
  );
}

function Ship3() {
  const W = 3 * CELL, H = CELL;
  const hy = H / 2;
  return (
    <g>
      <defs>
        <linearGradient id="hull3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={HULL_LIGHT} />
          <stop offset="45%" stopColor={HULL_MID} />
          <stop offset="100%" stopColor={HULL_DARK} />
        </linearGradient>
        <radialGradient id="deck3" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor={DECK_COLOR} />
          <stop offset="100%" stopColor="#6a94bc" />
        </radialGradient>
      </defs>

      {/* outer hull */}
      <rect x={4} y={hy - 15} width={W - 8} height={30} rx={15} fill="url(#hull3)" />

      {/* keel line */}
      <rect x={14} y={hy + 13} width={W - 32} height={3} rx={1.5} fill={HULL_DARK} opacity={0.5} />

      {/* deck */}
      <rect x={10} y={hy - 11} width={W - 20} height={22} rx={11} fill="url(#deck3)" />

      {/* bow */}
      <ellipse cx={W - 8} cy={hy} rx={7} ry={9} fill={BOW_RED} />
      <ellipse cx={W - 7} cy={hy} rx={3.5} ry={5.5} fill={BOW_RED2} />

      {/* stern */}
      <ellipse cx={8} cy={hy} rx={6} ry={9} fill={HULL_DARK} opacity={0.4} />

      {/* main bridge */}
      <Bridge x={W / 2 + 8} y={hy - 9} w={28} h={18} rx={3} />

      {/* mid cabin */}
      <Bridge x={W / 2 - 18} y={hy - 7} w={20} h={14} rx={2} />

      {/* rear cabin */}
      <Bridge x={W / 2 - 38} y={hy - 5} w={14} h={10} rx={2} />

      {/* funnels */}
      <Funnel cx={W / 2 + 22} cy={hy} w={8} h={9} />
      <Funnel cx={W / 2 + 10} cy={hy} w={6} h={7} />

      {/* portholes — port side */}
      <Porthole cx={W / 2 - 8}  cy={hy} />
      <Porthole cx={W / 2 + 5}  cy={hy} />
      <Porthole cx={W / 2 - 25} cy={hy} />

      {/* anchor chain detail */}
      <line x1={W - 16} y1={hy - 8} x2={W - 20} y2={hy - 3} stroke={HULL_DARK} strokeWidth={1.2} opacity={0.5} />

      {/* waterline stripe */}
      <rect x={6} y={hy + 12} width={W - 20} height={2} rx={1} fill={STRIPE} opacity={0.22} />
    </g>
  );
}

function Ship4() {
  const W = 4 * CELL, H = CELL;
  const hy = H / 2;
  return (
    <g>
      <defs>
        <linearGradient id="hull4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={HULL_LIGHT} />
          <stop offset="40%" stopColor={HULL_MID} />
          <stop offset="100%" stopColor={HULL_DARK} />
        </linearGradient>
        <radialGradient id="deck4" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={DECK_COLOR} />
          <stop offset="100%" stopColor="#5a88b0" />
        </radialGradient>
        <linearGradient id="armorgrd" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3a5a80" />
          <stop offset="100%" stopColor="#1a3a60" />
        </linearGradient>
      </defs>

      {/* outer hull */}
      <rect x={4} y={hy - 16} width={W - 8} height={32} rx={16} fill="url(#hull4)" />

      {/* armor belt */}
      <rect x={14} y={hy + 12} width={W - 30} height={4} rx={2} fill="url(#armorgrd)" />
      <rect x={14} y={hy - 16} width={W - 30} height={4} rx={2} fill="url(#armorgrd)" />

      {/* deck */}
      <rect x={11} y={hy - 12} width={W - 22} height={24} rx={12} fill="url(#deck4)" />

      {/* bow */}
      <ellipse cx={W - 8} cy={hy} rx={8} ry={10} fill={BOW_RED} />
      <ellipse cx={W - 7} cy={hy} rx={4} ry={6} fill={BOW_RED2} />
      {/* bow anchor port */}
      <circle cx={W - 14} cy={hy - 5} r={2.5} fill={HULL_DARK} />
      <circle cx={W - 14} cy={hy - 5} r={1.2} fill="#0d4080" />

      {/* stern */}
      <ellipse cx={8} cy={hy} rx={7} ry={10} fill={HULL_DARK} opacity={0.45} />

      {/* main command bridge — tallest, centered right */}
      <Bridge x={W / 2 + 10} y={hy - 10} w={36} h={20} rx={4} />

      {/* forward superstructure */}
      <Bridge x={W / 2 - 15} y={hy - 8} w={22} h={16} rx={3} />

      {/* mid secondary cabin */}
      <Bridge x={W / 2 - 38} y={hy - 6} w={18} h={12} rx={2} />

      {/* stern cabin */}
      <Bridge x={W / 2 - 60} y={hy - 5} w={14} h={10} rx={2} />

      {/* main funnels */}
      <Funnel cx={W / 2 + 30} cy={hy} w={9} h={10} />
      <Funnel cx={W / 2 + 18} cy={hy} w={8} h={9} />
      <Funnel cx={W / 2 + 6}  cy={hy} w={6} h={7} />

      {/* gun turret front */}
      <ellipse cx={W - 22} cy={hy} rx={7} ry={6} fill="#1a3a60" />
      <ellipse cx={W - 22} cy={hy} rx={5} ry={4} fill="#2a5080" />
      {/* gun barrel */}
      <rect x={W - 16} y={hy - 1} width={12} height={2} rx={1} fill={HULL_DARK} />
      <rect x={W - 16} y={hy + 1} width={10} height={1.5} rx={0.8} fill="#3a6090" />

      {/* gun turret aft */}
      <ellipse cx={22} cy={hy} rx={6} ry={5} fill="#1a3a60" />
      <ellipse cx={22} cy={hy} rx={4} ry={3.5} fill="#2a5080" />
      {/* gun barrel pointing stern */}
      <rect x={8} y={hy - 1} width={11} height={2} rx={1} fill={HULL_DARK} />

      {/* portholes — multiple rows */}
      <Porthole cx={W / 2 - 5}  cy={hy} />
      <Porthole cx={W / 2 + 2}  cy={hy} />
      <Porthole cx={W / 2 - 22} cy={hy} />
      <Porthole cx={W / 2 - 52} cy={hy} />

      {/* side detail lines */}
      <line x1={15} y1={hy - 9}  x2={W - 18} y2={hy - 9}  stroke={STRIPE} strokeWidth={0.8} opacity={0.15} />
      <line x1={15} y1={hy + 9}  x2={W - 18} y2={hy + 9}  stroke={STRIPE} strokeWidth={0.8} opacity={0.15} />

      {/* waterline stripe */}
      <rect x={6} y={hy + 13} width={W - 20} height={2} rx={1} fill={STRIPE} opacity={0.2} />
    </g>
  );
}

// ─── Hit/Sunk overlays ────────────────────────────────────────────────────────

function HitOverlay({ w, h }: { w: number; h: number }) {
  // Red X cross in the center
  const cx = w / 2, cy = h / 2;
  const arm = Math.min(w, h) * 0.22;
  return (
    <g>
      <line x1={cx - arm} y1={cy - arm} x2={cx + arm} y2={cy + arm}
        stroke="#e74c3c" strokeWidth={3.5} strokeLinecap="round" opacity={0.92} />
      <line x1={cx + arm} y1={cy - arm} x2={cx - arm} y2={cy + arm}
        stroke="#e74c3c" strokeWidth={3.5} strokeLinecap="round" opacity={0.92} />
      {/* flame sparks */}
      {Array.from({ length: 4 }).map((_, i) => {
        const ox = (i % 2 === 0 ? -1 : 1) * (arm * 0.4 + i * 3);
        const oy = (i < 2 ? -1 : 1) * (arm * 0.3 + i * 2);
        return (
          <ellipse key={i} cx={cx + ox} cy={cy + oy}
            rx={2.2} ry={3.5} fill="#e67e22" opacity={0.75} />
        );
      })}
    </g>
  );
}

function SunkOverlay({ w, h }: { w: number; h: number }) {
  // Dark semi-transparent fill + bubbles
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#0a2040" opacity={0.62} rx={4} />
      {/* bubble circles */}
      {[
        { cx: w * 0.25, cy: h * 0.35 },
        { cx: w * 0.5,  cy: h * 0.25 },
        { cx: w * 0.72, cy: h * 0.4  },
        { cx: w * 0.38, cy: h * 0.6  },
      ].map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={3 + i * 0.8}
          fill="none" stroke="#5ba3d9" strokeWidth={1.2} opacity={0.7} />
      ))}
      {/* X marks */}
      {[w * 0.35, w * 0.65].map((x, i) => (
        <g key={i}>
          <line x1={x - 5} y1={h / 2 - 5} x2={x + 5} y2={h / 2 + 5}
            stroke="#c0392b" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={x + 5} y1={h / 2 - 5} x2={x - 5} y2={h / 2 + 5}
            stroke="#c0392b" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ShipSVG: React.FC<ShipSVGProps> = ({
  size,
  isVertical = false,
  isHit = false,
  isSunk = false,
  className,
  style,
}) => {
  // In horizontal orientation the SVG canvas is (size*CELL) × CELL.
  // For vertical we keep the same drawing but rotate 90° via CSS,
  // which means the parent must swap width/height expectations.
  // The SVG viewBox stays horizontal; CSS transform handles orientation.

  const vbW = size * CELL;
  const vbH = CELL;

  const shipBody = (() => {
    switch (size) {
      case 1: return <Ship1 />;
      case 2: return <Ship2 />;
      case 3: return <Ship3 />;
      case 4: return <Ship4 />;
    }
  })();

  // Vertical: rotate the SVG 90 degrees. The parent container should have
  // its width/height already swapped (height = size cells, width = 1 cell).
  // We achieve this by wrapping in a div that handles the geometry.
  const overlayW = vbW;
  const overlayH = vbH;

  const svgElement = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      {shipBody}
      {isHit  && !isSunk && <HitOverlay  w={overlayW} h={overlayH} />}
      {isSunk             && <SunkOverlay w={overlayW} h={overlayH} />}
    </svg>
  );

  if (isVertical) {
    // The container has width=1cell, height=size*cells.
    // We rotate the SVG (which is naturally horizontal) by 90° inside.
    // Using a wrapper with the correct bounding-box geometry.
    return (
      <div
        className={className}
        style={{
          ...style,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/*
          The SVG is (size*CELL) wide × CELL tall in its own space.
          After rotating 90°CW the visual box becomes CELL wide × (size*CELL) tall.
          We position it absolutely, set its dimensions to the PRE-rotation size,
          then let CSS rotate it.
        */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: "rotate(90deg)",
            transformOrigin: "center center",
          }}
        >
          {svgElement}
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
    >
      {svgElement}
    </div>
  );
};

export default ShipSVG;
