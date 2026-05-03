/**
 * Tiny zero-dependency markdown transformer for release notes.
 *
 * Supports the spec's basic subset only:
 *   - Blank-line separated paragraphs (`\n\n`)
 *   - Lines starting with `* ` or `- ` → bullet list items, contiguous
 *     bullets group into a single `<ul>`
 *   - Single newlines inside a paragraph → `<br />`
 *
 * Output is a flat tree of `MarkdownNode` ready for the renderer to map
 * into JSX. No `dangerouslySetInnerHTML` — every node is a primitive
 * shape we hand-render so untrusted text can never inject HTML.
 */

export type MarkdownNode =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'list'; items: string[] };

const BULLET_RE = /^\s*(?:\*|-)\s+(.*)$/;

export function parseMarkdown(text: string): MarkdownNode[] {
  const collapsed = text.replace(/\r\n/g, '\n').trim();
  if (!collapsed) return [];

  // Split on blank lines first — those are paragraph boundaries regardless
  // of bullet membership. Inside a block we then split list runs out.
  const blocks = collapsed.split(/\n{2,}/);
  const out: MarkdownNode[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    let i = 0;
    while (i < lines.length) {
      // Scan a contiguous bullet run.
      if (BULLET_RE.test(lines[i])) {
        const items: string[] = [];
        while (i < lines.length && BULLET_RE.test(lines[i])) {
          const m = lines[i].match(BULLET_RE)!;
          items.push(m[1].trim());
          i++;
        }
        out.push({ kind: 'list', items });
        continue;
      }
      // Otherwise consume up to the next bullet line as a single paragraph.
      const paragraphLines: string[] = [];
      while (i < lines.length && !BULLET_RE.test(lines[i])) {
        paragraphLines.push(lines[i]);
        i++;
      }
      if (paragraphLines.some((l) => l.trim() !== '')) {
        out.push({
          kind: 'paragraph',
          lines: paragraphLines.map((l) => l.trim()).filter((l) => l !== ''),
        });
      }
    }
  }

  return out;
}
