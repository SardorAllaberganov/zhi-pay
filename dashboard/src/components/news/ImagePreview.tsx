import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  url: string | null;
  alt?: string;
  className?: string;
  /** Visual variant — table row uses a small fixed 60×40, mobile card uses a left rail. */
  size?: 'thumb' | 'rail';
}

/**
 * Compact cover-image preview for the news list. Falls back to a slate
 * placeholder with an icon if the URL is missing or fails to load.
 */
export function ImagePreview({ url, alt = '', className, size = 'thumb' }: Props) {
  const [errored, setErrored] = useState(false);

  const wrapperClasses = cn(
    'shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center',
    size === 'thumb' ? 'h-10 w-[60px]' : 'h-16 w-[88px]',
    className,
  );

  if (!url || errored) {
    return (
      <div className={wrapperClasses} aria-hidden="true">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
