import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { parseMarkdown } from './modals/markdown';

/**
 * Renders the basic-markdown subset (paragraphs + bullets) as flat JSX.
 * No `dangerouslySetInnerHTML` — every text node is a primitive React
 * string so untrusted content cannot inject markup.
 */
export function MarkdownView({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const nodes = parseMarkdown(text);
  if (nodes.length === 0) {
    return <p className={cn('text-sm text-muted-foreground italic', className)}>—</p>;
  }
  return (
    <div className={cn('space-y-2 text-sm leading-relaxed', className)}>
      {nodes.map((n, idx) => {
        if (n.kind === 'list') {
          return (
            <ul key={idx} className="ml-5 list-disc space-y-1 text-foreground/90">
              {n.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="text-foreground/90">
            {n.lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
