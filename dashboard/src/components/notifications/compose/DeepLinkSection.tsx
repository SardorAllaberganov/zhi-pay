import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type DeepLinkScreen,
  DEEP_LINK_SCREEN_LABEL_KEY,
  DEEP_LINK_SCREEN_ORDER,
  previewDeepLink,
} from '@/lib/deepLinkScreens';
import type { DeepLinkInput } from '../types';
import { ParamsEditor } from './ParamsEditor';

interface DeepLinkSectionProps {
  value: DeepLinkInput;
  onChange: (next: Partial<DeepLinkInput>) => void;
  onParamsErrorChange?: (err: string | null) => void;
}

export function DeepLinkSection({ value, onChange, onParamsErrorChange }: DeepLinkSectionProps) {
  const previewString = previewDeepLink(value.screen, value.params);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Label htmlFor="notif-deep-link-toggle" className="cursor-pointer">
            {t('admin.notifications.compose.deep-link.toggle')}
          </Label>
        </div>
        <Switch
          id="notif-deep-link-toggle"
          checked={value.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
          aria-label={t('admin.notifications.compose.deep-link.toggle')}
        />
      </div>

      {value.enabled && (
        <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
          <div className="space-y-2">
            <Label htmlFor="notif-deep-link-screen">
              {t('admin.notifications.compose.deep-link.screen')}
            </Label>
            <Select
              value={value.screen}
              onValueChange={(v) => onChange({ screen: v as DeepLinkScreen, params: {} })}
            >
              <SelectTrigger id="notif-deep-link-screen">
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

          <div className="space-y-2">
            <Label>{t('admin.notifications.compose.deep-link.params')}</Label>
            <ParamsEditor
              value={value.params}
              onChange={(next) => onChange({ params: next })}
              screen={value.screen}
              onErrorChange={onParamsErrorChange}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('admin.notifications.compose.deep-link.preview-label')}
            </Label>
            <div
              className={cn(
                'rounded-md border border-border bg-background px-3 py-2',
                'font-mono text-sm break-all',
              )}
            >
              {previewString}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
