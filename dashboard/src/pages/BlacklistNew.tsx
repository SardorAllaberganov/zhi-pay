import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { PreAddCheckPanel } from '@/components/blacklist/PreAddCheckPanel';
import { ConfirmAddDialog } from '@/components/blacklist/modals/ConfirmAddDialog';
import {
  addBlacklistEntry,
  BLACKLIST_ADMIN_POOL,
  preAddCheck,
  type BlacklistSeverity,
  type BlacklistType,
  type PreAddCheckResult,
} from '@/data/mockBlacklist';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

const TYPE_ORDER: BlacklistType[] = ['phone', 'pinfl', 'device_id', 'ip', 'card_token'];
const TYPE_LABEL_KEY: Record<BlacklistType, string> = {
  phone: 'admin.blacklist.type.phone',
  pinfl: 'admin.blacklist.type.pinfl',
  device_id: 'admin.blacklist.type.device',
  ip: 'admin.blacklist.type.ip',
  card_token: 'admin.blacklist.type.card-token',
};
const TYPE_PLACEHOLDER_KEY: Record<BlacklistType, string> = {
  phone: 'admin.blacklist.add.placeholder.phone',
  pinfl: 'admin.blacklist.add.placeholder.pinfl',
  device_id: 'admin.blacklist.add.placeholder.device',
  ip: 'admin.blacklist.add.placeholder.ip',
  card_token: 'admin.blacklist.add.placeholder.card-token',
};

const ACTOR = BLACKLIST_ADMIN_POOL[0];

const MIN_REASON = 30;

function parseTypeFromQuery(raw: string | null): BlacklistType {
  if (raw === 'phone' || raw === 'pinfl' || raw === 'device_id' || raw === 'ip' || raw === 'card_token') {
    return raw;
  }
  return 'phone';
}

function validateIdentifier(type: BlacklistType, value: string): string | null {
  const v = value.trim();
  if (v === '') return 'admin.blacklist.add.validation.identifier-required';
  if (type === 'phone') {
    const compact = v.replace(/\s+/g, '');
    if (!/^\+\d{8,15}$/.test(compact)) {
      return 'admin.blacklist.add.validation.phone-format';
    }
  } else if (type === 'pinfl') {
    if (!/^\d{14}$/.test(v)) {
      return 'admin.blacklist.add.validation.pinfl-format';
    }
  } else if (type === 'device_id') {
    if (!/^[0-9a-fA-F]{8,}$/.test(v)) {
      return 'admin.blacklist.add.validation.device-format';
    }
  } else if (type === 'ip') {
    const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    const ipv6 = /^[0-9a-fA-F:]+$/;
    if (!(ipv4.test(v) || (ipv6.test(v) && v.includes(':')))) {
      return 'admin.blacklist.add.validation.ip-format';
    }
  } else if (type === 'card_token') {
    if (v.length < 8) {
      return 'admin.blacklist.add.validation.card-format';
    }
  }
  return null;
}

export function BlacklistNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = parseTypeFromQuery(searchParams.get('type'));
  const initialIdentifier = searchParams.get('identifier') ?? '';

  const [type, setType] = useState<BlacklistType>(initialType);
  const [identifier, setIdentifier] = useState<string>(initialIdentifier);
  const [reason, setReason] = useState<string>('');
  const [severity, setSeverity] = useState<BlacklistSeverity>('suspected');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const idError = validateIdentifier(type, identifier);
  const reasonOk = reason.trim().length >= MIN_REASON;

  const preAdd: PreAddCheckResult = useMemo(() => {
    if (idError !== null) {
      return { identifier: identifier.trim(), duplicate: null, match: null, noStore: false };
    }
    return preAddCheck(type, identifier.trim());
  }, [type, identifier, idError]);

  const blockedByDuplicate = preAdd.duplicate !== null;
  const canSubmit = !idError && reasonOk && !blockedByDuplicate;

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit) return;
    setConfirmOpen(true);
  }

  function commit() {
    setConfirmOpen(false);
    try {
      addBlacklistEntry({
        type,
        identifier: identifier.trim(),
        severity,
        reason: reason.trim(),
        expiresAt,
        actor: ACTOR,
      });
      toast.success(t('admin.blacklist.toast.added.title'));
      navigate(`/compliance/blacklist?type=${type}`);
    } catch (err) {
      toast.error(t('admin.blacklist.toast.added.error.title'), {
        description: err instanceof Error ? err.message : t('admin.blacklist.toast.added.error.body'),
      });
    }
  }

  // Cmd/Ctrl+Enter submit when valid.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit, type, identifier, reason, severity, expiresAt]);

  return (
    <div className="space-y-4 pb-28">
      <Link
        to="/compliance/blacklist"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('admin.blacklist.add.back')}
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('admin.blacklist.add.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.blacklist.add.subtitle')}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {t('admin.blacklist.add.section.identity')}
              </CardTitle>
              <CardDescription>
                {t('admin.blacklist.add.section.identity-desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t('admin.blacklist.add.type')}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <span>{t(TYPE_LABEL_KEY[type])}</span>
                      <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    <DropdownMenuRadioGroup
                      value={type}
                      onValueChange={(next) => setType(next as BlacklistType)}
                    >
                      {TYPE_ORDER.map((opt) => (
                        <DropdownMenuRadioItem key={opt} value={opt}>
                          {t(TYPE_LABEL_KEY[opt])}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bl-identifier">
                  {t('admin.blacklist.add.identifier')}
                </Label>
                <Input
                  id="bl-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t(TYPE_PLACEHOLDER_KEY[type])}
                  className={cn(
                    'h-10',
                    idError && identifier.trim() !== '' && 'border-warning-600 focus-visible:ring-warning-600/30',
                  )}
                />
                {idError && identifier.trim() !== '' && (
                  <p className="text-sm text-warning-700 dark:text-warning-600">
                    {t(idError)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {t('admin.blacklist.add.section.justification')}
              </CardTitle>
              <CardDescription>
                {t('admin.blacklist.add.section.justification-desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bl-reason">{t('admin.blacklist.add.reason')}</Label>
                <textarea
                  id="bl-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p
                  className={cn(
                    'text-sm',
                    reasonOk ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
                  )}
                >
                  {t('admin.blacklist.add.help.reason', {
                    count: reason.trim().length,
                    min: MIN_REASON,
                  })}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>{t('admin.blacklist.add.severity')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <SeverityRadio
                    value="suspected"
                    label={t('admin.blacklist.severity.suspected')}
                    description={t('admin.blacklist.add.severity.suspected-desc')}
                    selected={severity === 'suspected'}
                    onSelect={() => setSeverity('suspected')}
                  />
                  <SeverityRadio
                    value="confirmed"
                    label={t('admin.blacklist.severity.confirmed')}
                    description={t('admin.blacklist.add.severity.confirmed-desc')}
                    selected={severity === 'confirmed'}
                    onSelect={() => setSeverity('confirmed')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t('admin.blacklist.add.expires-at')}</Label>
                <DateTimeInput
                  value={expiresAt}
                  onValueChange={setExpiresAt}
                  allowEmpty
                  ariaLabel={t('admin.blacklist.add.expires-at')}
                />
                <p className="text-sm text-muted-foreground">
                  {t('admin.blacklist.add.help.expires-at')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <PreAddCheckPanel result={preAdd} />
        </div>

        {/* Sticky bottom action bar — canonical overlay. */}
        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
            'md:left-[var(--sidebar-width,4rem)]',
            'px-4 md:px-6 py-3',
          )}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/compliance/blacklist')}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!canSubmit}
            >
              {t('admin.blacklist.add.submit')}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmAddDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={commit}
      />
    </div>
  );
}

function SeverityRadio({
  value,
  label,
  description,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-value={value}
      className={cn(
        'rounded-md border px-3 py-2 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
          : 'border-border bg-background hover:bg-muted',
      )}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
