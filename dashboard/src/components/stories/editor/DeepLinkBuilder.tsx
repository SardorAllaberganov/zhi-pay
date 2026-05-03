import { Copy, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import {
  DEEP_LINK_SCREEN_LABEL_KEY,
  DEEP_LINK_SCREEN_ORDER,
  type DeepLinkScreen,
  previewDeepLink,
} from '@/lib/deepLinkScreens';
import type { CtaDeepLink } from '@/data/mockStories';
import { ParamsEditor } from './ParamsEditor';

interface Props {
  value: CtaDeepLink;
  onChange: (next: CtaDeepLink) => void;
  onParamsErrorChange?: (err: string | null) => void;
}

export function DeepLinkBuilder({ value, onChange, onParamsErrorChange }: Props) {
  const previewUri = previewDeepLink(value.screen, value.params);
  const copyState = useCopyFeedback();

  return (
    <div className="space-y-4">
      {/* Screen selector */}
      <div className="space-y-2">
        <Label>{t('admin.stories.editor.cta.screen-label')}</Label>
        <Select
          value={value.screen}
          onValueChange={(next: string) => onChange({ ...value, screen: next as DeepLinkScreen })}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEEP_LINK_SCREEN_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {t(DEEP_LINK_SCREEN_LABEL_KEY[s])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Params editor */}
      <div className="space-y-2">
        <Label>{t('admin.stories.editor.cta.params-label')}</Label>
        <ParamsEditor
          screen={value.screen}
          value={value.params}
          onChange={(params) => onChange({ ...value, params })}
          onErrorChange={onParamsErrorChange}
        />
      </div>

      {/* Preview deep-link string */}
      <div className="space-y-2">
        <Label>{t('admin.stories.editor.cta.preview-label')}</Label>
        <div className="flex items-stretch gap-2">
          <code
            className={cn(
              'flex-1 truncate rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm',
              'text-foreground/85',
            )}
          >
            {previewUri}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyState.copy(previewUri)}
            className="shrink-0"
            aria-label={t('common.actions.copy')}
          >
            {copyState.copied ? (
              <span className="inline-flex items-center gap-1.5 text-success-700">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.actions.copied')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.actions.copy')}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
