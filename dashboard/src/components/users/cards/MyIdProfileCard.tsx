import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CollapsibleCard } from '@/components/transfer-detail/cards/CollapsibleCard';
import { cn, formatDate, maskDocNumber, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { MyIdResponse } from '@/data/mockUsers';

interface Props {
  response: MyIdResponse;
}

export function MyIdProfileCard({ response }: Props) {
  const c = response.profile.common_data;
  const d = response.profile.doc_data;
  const contacts = response.profile.contacts;
  const addr = response.profile.address;
  const reg = addr.permanent_registration;

  const fullNameUz = [c.last_name, c.first_name, c.middle_name].filter(Boolean).join(' ');
  const fullNameEn = [c.first_name_en, c.last_name_en].filter(Boolean).join(' ');
  const reuidExpires = new Date(response.reuid.expires_at * 1000);
  const matchScorePct = Math.round(response.comparison_value * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{t('admin.users.detail.myid.title')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('admin.users.detail.myid.subtitle')}
            </p>
          </div>
          <MatchScoreBadge pct={matchScorePct} />
        </CardHeader>

        <CardContent className="space-y-5">
          <Section title={t('admin.users.detail.myid.section.identity')}>
            <Field label={t('admin.users.detail.myid.field.full-name-uz')}>
              {fullNameUz || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.full-name-en')} mono>
              {fullNameEn || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.gender')}>
              <span className="capitalize">{c.gender || '—'}</span>
            </Field>
            <Field label={t('admin.users.detail.myid.field.birth-date')}>
              {c.birth_date ? formatDate(new Date(c.birth_date)) : '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.birth-place')}>
              {c.birth_place || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.nationality')}>
              {c.nationality || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.citizenship')}>
              {c.citizenship || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.pinfl')} mono>
              {c.pinfl ? maskPinfl(c.pinfl) : '—'}
            </Field>
          </Section>

          <Section title={t('admin.users.detail.myid.section.document')}>
            <Field label={t('admin.users.detail.myid.field.doc-type')}>
              <span className="capitalize">{d.doc_type || '—'}</span>
            </Field>
            <Field label={t('admin.users.detail.myid.field.doc-number')} mono>
              {d.pass_data ? maskDocNumber(d.pass_data) : '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.issued-by')}>
              {d.issued_by || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.issued-date')}>
              {d.issued_date ? formatDate(new Date(d.issued_date)) : '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.expiry-date')}>
              {d.expiry_date ? formatDate(new Date(d.expiry_date)) : '—'}
            </Field>
          </Section>

          <Section title={t('admin.users.detail.myid.section.contacts')}>
            <Field label={t('admin.users.detail.myid.field.phone')} mono>
              {contacts.phone || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.email')}>
              {contacts.email || '—'}
            </Field>
          </Section>

          <Section title={t('admin.users.detail.myid.section.address')}>
            <Field label={t('admin.users.detail.myid.field.permanent-address')} fullWidth>
              {addr.permanent_address || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.temporary-address')} fullWidth>
              {addr.temporary_address || (
                <span className="italic text-muted-foreground">
                  {t('admin.users.detail.myid.no-temporary')}
                </span>
              )}
            </Field>
            <Field label={t('admin.users.detail.myid.field.region')}>
              {reg.region || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.district')}>
              {reg.district || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.mfy')}>
              {reg.mfy || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.cadastre')} mono>
              {reg.cadastre || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.registration-date')}>
              {reg.registration_date ? formatDate(new Date(reg.registration_date)) : '—'}
            </Field>
          </Section>

          <Section title={t('admin.users.detail.myid.section.metadata')}>
            <Field label={t('admin.users.detail.myid.field.job-id')} mono copyable>
              {response.job_id}
            </Field>
            <Field label={t('admin.users.detail.myid.field.reuid')} mono copyable>
              {response.reuid.value}
            </Field>
            <Field label={t('admin.users.detail.myid.field.reuid-expires')}>
              {formatDate(reuidExpires)}
            </Field>
            <Field label={t('admin.users.detail.myid.field.sdk-hash')} mono>
              {c.sdk_hash || '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.last-update-pass')}>
              {c.last_update_pass_data
                ? formatDate(new Date(c.last_update_pass_data))
                : '—'}
            </Field>
            <Field label={t('admin.users.detail.myid.field.last-update-address')}>
              {c.last_update_address
                ? formatDate(new Date(c.last_update_address))
                : '—'}
            </Field>
          </Section>
        </CardContent>
      </Card>

      <CollapsibleCard
        title={t('admin.users.detail.myid.raw-title')}
        defaultOpen={false}
      >
        <RawJsonViewer response={response} />
      </CollapsibleCard>
    </div>
  );
}

function MatchScoreBadge({ pct }: { pct: number }) {
  const tone =
    pct >= 95
      ? 'bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600'
      : pct >= 85
        ? 'bg-warning-50 dark:bg-warning-700/15 text-warning-700 dark:text-warning-600'
        : 'bg-danger-50 dark:bg-danger-700/15 text-danger-700 dark:text-danger-600';
  return (
    <div className={cn('shrink-0 rounded-md px-3 py-1.5 text-center', tone)}>
      <div className="text-xs uppercase tracking-wider font-medium">
        {t('admin.users.detail.myid.match-score')}
      </div>
      <div className="text-base font-semibold tabular">{pct}%</div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
        {title}
      </h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  fullWidth?: boolean;
  copyable?: boolean;
}

function Field({ label, children, mono, fullWidth, copyable }: FieldProps) {
  const [copied, setCopied] = useState(false);
  function copy() {
    if (typeof children !== 'string') return;
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <div className={cn(fullWidth && 'sm:col-span-2')}>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-sm flex items-center gap-1.5', mono && 'font-mono tabular')}>
        <span className="break-words min-w-0">{children}</span>
        {copyable && typeof children === 'string' && (
          <button
            type="button"
            onClick={copy}
            aria-label="Copy"
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-success-600" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </dd>
    </div>
  );
}

function RawJsonViewer({ response }: { response: MyIdResponse }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(response, replacer, 2);

  function copy() {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('admin.users.detail.myid.raw-note')}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {t('admin.users.detail.myid.raw-label')}
        </span>
        <Button size="sm" variant="ghost" onClick={copy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5 text-success-600" aria-hidden="true" />
              {t('admin.users.detail.myid.copied')}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              {t('admin.users.detail.myid.copy')}
            </>
          )}
        </Button>
      </div>
      <pre className="rounded-md bg-muted/60 dark:bg-muted/40 p-3 text-sm overflow-x-auto overflow-y-hidden">
        <code className="font-mono tabular text-foreground/90">{json}</code>
      </pre>
    </div>
  );
}

function replacer(key: string, value: unknown): unknown {
  // Mask PII in the raw viewer too — admins see structured fields above with
  // proper masking; the raw JSON should not leak the full pinfl or doc number.
  if (key === 'pinfl' && typeof value === 'string' && value.length === 14) {
    return '••••••••••' + value.slice(-4);
  }
  if ((key === 'pass_data' || key === 'doc_number') && typeof value === 'string' && value.length >= 5) {
    return value.slice(0, 2) + '••••' + value.slice(-3);
  }
  if (typeof value === 'bigint') return value.toString();
  return value;
}
