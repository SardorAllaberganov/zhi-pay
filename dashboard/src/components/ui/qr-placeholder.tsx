import { cn } from '@/lib/utils';

interface QrPlaceholderProps {
  /** The payload that would be encoded — drives a deterministic visual hash. */
  value: string;
  /** Pixel size — default 200. */
  size?: number;
  className?: string;
}

/**
 * Deterministic QR-shaped SVG placeholder. Renders a 25x25 module grid
 * with the three position-detection patterns and a deterministic body
 * derived from the payload. Visually convincing for design probing
 * without pulling in a real QR-code library — drop in `qrcode.react`
 * (or similar) later by replacing the body of this component; the
 * consumer API stays the same.
 *
 * NOT a real QR code. Do not attempt to scan.
 */
export function QrPlaceholder({ value, size = 200, className }: QrPlaceholderProps) {
  const modules = 25;
  const cellSize = size / modules;

  // Deterministic visual hash derived from the payload. Real QR uses
  // Reed-Solomon encoding; we just need a visual that doesn't look
  // identical for every input.
  const hash = hashString(value);

  function isFinder(row: number, col: number): boolean {
    // Top-left
    if (row < 7 && col < 7) return finderPattern(row, col);
    // Top-right
    if (row < 7 && col >= modules - 7) return finderPattern(row, col - (modules - 7));
    // Bottom-left
    if (row >= modules - 7 && col < 7) return finderPattern(row - (modules - 7), col);
    return false;
  }

  function isFinderRegion(row: number, col: number): boolean {
    if (row < 8 && col < 8) return true;
    if (row < 8 && col >= modules - 8) return true;
    if (row >= modules - 8 && col < 8) return true;
    return false;
  }

  function finderPattern(r: number, c: number): boolean {
    // 7x7 finder: outer ring + 3x3 center
    const onRing = r === 0 || r === 6 || c === 0 || c === 6;
    const inCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
    return onRing || inCenter;
  }

  function bodyModule(row: number, col: number): boolean {
    // Mix the row/col with the deterministic hash to produce a stable
    // pattern that varies per payload but is visually QR-like.
    const seed = (row * 31 + col * 17 + hash) >>> 0;
    return (seed * 2654435761) >>> 24 < 110;
  }

  const cells: { x: number; y: number; on: boolean }[] = [];
  for (let row = 0; row < modules; row += 1) {
    for (let col = 0; col < modules; col += 1) {
      const isPositionDetector = isFinder(row, col);
      if (isFinderRegion(row, col)) {
        // Finder region — only the actual pattern modules render filled
        cells.push({ x: col * cellSize, y: row * cellSize, on: isPositionDetector });
      } else {
        cells.push({ x: col * cellSize, y: row * cellSize, on: bodyModule(row, col) });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="2FA setup QR code (placeholder)"
      className={cn('rounded-md bg-white p-3 shadow-sm', className)}
    >
      <rect width={size} height={size} fill="#fff" />
      {cells
        .filter((c) => c.on)
        .map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={cellSize} height={cellSize} fill="#000" />
        ))}
    </svg>
  );
}

function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
