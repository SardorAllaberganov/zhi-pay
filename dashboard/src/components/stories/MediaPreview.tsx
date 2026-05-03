import { Play, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoryType } from '@/data/mockStories';

/**
 * 16:9 media preview for the list-card. The mock URLs in `mockStories.ts`
 * point at `cdn.zhipay.uz/...` which won't resolve in the prototype — we
 * render a deterministic gradient placeholder seeded by the URL string
 * + a centered icon (with a play overlay for video). Real backend would
 * stream the first frame of the video or the cover image directly.
 */

function gradientFromUrl(url: string): { from: string; to: string } {
  // Deterministic FNV-1a hash → two HSL anchors in a calm range.
  let h = 0x811c9dc5;
  for (let i = 0; i < url.length; i++) {
    h ^= url.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const baseHue = h % 360;
  const altHue = (baseHue + 28) % 360;
  return {
    from: `hsl(${baseHue} 55% 86%)`,
    to: `hsl(${altHue} 60% 70%)`,
  };
}

export function MediaPreview({
  url,
  type,
  className,
}: {
  url: string;
  type: StoryType;
  className?: string;
}) {
  const { from, to } = gradientFromUrl(url);
  const Icon = type === 'video' ? VideoIcon : ImageIcon;
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-md ring-1 ring-border/60',
        className,
      )}
      style={{
        aspectRatio: '16 / 9',
        backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-10 w-10 text-foreground/40" />
      </div>
      {type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/55 text-background ring-2 ring-background/30 backdrop-blur-sm">
            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * 9:16 media preview for the phone-mockup body — same gradient generator,
 * scaled to portrait. Used by `<PhoneMockup>` so the preview pane reads as
 * a real story render.
 */
export function MediaPreviewPortrait({
  url,
  type,
  className,
}: {
  url: string;
  type: StoryType;
  className?: string;
}) {
  const { from, to } = gradientFromUrl(url);
  const Icon = type === 'video' ? VideoIcon : ImageIcon;
  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{
        backgroundImage: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-16 w-16 text-foreground/30" />
      </div>
    </div>
  );
}
