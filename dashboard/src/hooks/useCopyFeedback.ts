import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * In-place copy feedback. Each consumer reads `copied` to swap its icon /
 * label / color for `timeoutMs` (default 1.5s) after a successful copy.
 * No toast — feedback stays at the cursor.
 *
 * Originally lived under `components/audit-log/`; lifted here when the
 * Services & Health surface picked up a second consumer (health-check URL
 * copy), per the design-system-layers rule that Patterns may not import
 * from other Patterns.
 */
export function useCopyFeedback(timeoutMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copy = useCallback(
    (value: string) => {
      void navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, timeoutMs);
    },
    [timeoutMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copied, copy };
}
