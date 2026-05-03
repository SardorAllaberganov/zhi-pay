/**
 * Reference-id generator for system error states.
 *
 * Renders as `8a7c-2f1e` — 8 lowercase hex chars with a single dash for
 * readability. Used in 500/503 footers and the corresponding system-event
 * audit row so admin support can correlate a user-facing crash with the
 * backend trace.
 *
 * Format: `[a-f0-9]{4}-[a-f0-9]{4}` (32 bits of entropy — fine for a
 * mock-side correlation handle; a real backend would mint a longer
 * trace id and the UI would shorten for display).
 */
export function generateReferenceId(): string {
  const half = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0');
  return `${half()}-${half()}`;
}
