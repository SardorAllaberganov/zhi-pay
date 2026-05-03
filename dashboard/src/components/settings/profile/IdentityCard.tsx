import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSession, updateMyProfile } from '@/lib/auth';
import { formatDate, cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { NameChangeReasonDialog } from './NameChangeReasonDialog';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super-admin',
  ops: 'Operations',
  compliance: 'Compliance',
  finance: 'Finance',
  engineering: 'Engineering',
};

export function IdentityCard() {
  const session = useSession();
  // session is guaranteed by AuthGuard but TS doesn't know that
  if (!session) return null;
  const profile = session.profile;

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dirty = useMemo(() => {
    const trimmedPhone = phone.trim() || null;
    const currentPhone = profile.phone || null;
    return displayName.trim() !== profile.displayName || trimmedPhone !== currentPhone;
  }, [displayName, phone, profile.displayName, profile.phone]);

  const handleSubmit = (reason: string) => {
    const result = updateMyProfile({
      displayName: displayName.trim(),
      phone: phone.trim() || null,
      reason,
    });
    if (result.ok) {
      toast.success(t('admin.settings.profile.toast.saved'));
      setConfirmOpen(false);
    } else if (result.reason === 'reason_too_short') {
      toast.error(t('admin.settings.profile.confirm.reason-required'));
    } else if (result.reason === 'no_changes') {
      toast.info(t('admin.settings.profile.toast.no-changes'));
      setConfirmOpen(false);
    } else {
      toast.error(t('admin.settings.profile.toast.error'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings.profile.identity')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <Avatar className="h-[72px] w-[72px]">
            <AvatarFallback
              className={cn(
                'text-lg font-semibold',
                'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
              )}
            >
              {initialsOf(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Wrapped span so disabled button still triggers tooltip on hover. */}
              <span tabIndex={0} className="inline-flex">
                <Button variant="ghost" size="sm" disabled>
                  {t('admin.settings.profile.avatar.change')}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t('admin.settings.profile.avatar.tooltip')}</TooltipContent>
          </Tooltip>
        </div>

        {/* Form grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="settings-fullname"
            label={t('admin.settings.profile.field.full-name')}
          >
            <Input
              id="settings-fullname"
              className="h-10"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
            />
          </FormField>

          <FormField
            id="settings-email"
            label={t('admin.settings.profile.field.email')}
            adornment={
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                {t('admin.settings.profile.field.email.managed')}
              </span>
            }
          >
            <Input
              id="settings-email"
              className="h-10"
              value={profile.email}
              readOnly
              aria-readonly="true"
            />
          </FormField>

          <FormField
            id="settings-phone"
            label={t('admin.settings.profile.field.phone')}
            hint={t('admin.settings.profile.field.phone.hint')}
          >
            <Input
              id="settings-phone"
              className="h-10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+998 90 123 45 67"
              autoComplete="tel"
            />
          </FormField>

          <FormField id="settings-role" label={t('admin.settings.profile.field.role')}>
            <div className="flex h-10 items-center">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                  'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {ROLE_LABEL[profile.role] ?? profile.role}
              </span>
            </div>
          </FormField>

          <FormField
            id="settings-created"
            label={t('admin.settings.profile.field.created-at')}
          >
            <div className="flex h-10 items-center text-sm text-muted-foreground">
              {formatDate(profile.createdAt)}
            </div>
          </FormField>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            disabled={!dirty}
            onClick={() => setConfirmOpen(true)}
            aria-disabled={!dirty}
          >
            {t('admin.settings.profile.action.save')}
          </Button>
        </div>
      </CardContent>

      <NameChangeReasonDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onSubmit={handleSubmit}
        previousName={profile.displayName}
        nextName={displayName.trim()}
      />
    </Card>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  adornment?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({ id, label, hint, adornment, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {adornment}
      </div>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
