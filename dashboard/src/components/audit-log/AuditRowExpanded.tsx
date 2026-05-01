import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  countRelatedEvents,
  formatContextJson,
  type AuditEvent,
} from '@/data/mockAuditLog';
import { useCopyFeedback } from './useCopyFeedback';

interface AuditRowExpandedProps {
  event: AuditEvent;
  /** When clicked, applies entity-ref filter to this entity's id. */
  onScopeToEntity: (entityId: string) => void;
}

const ENTITY_LINK: Partial<Record<AuditEvent['entity']['type'], (id: string) => string | null>> = {
  transfer: (id) => (id.startsWith('tx_seed') || id.startsWith('bridge_') ? null : `/operations/transfers/${id}`),
  user: (id) => (id.startsWith('u_seed') ? null : `/customers/users/${id}`),
  card: (id) => (id.startsWith('c_seed') ? null : `/customers/cards/${id}`),
  fx: (_id) => '/finance/fx-config',
  commission: (_id) => '/finance/commissions',
  aml: (id) => (id.startsWith('aml_seed') ? null : `/operations/aml-triage/${id}`),
  kyc: (id) => (id.startsWith('kyc_seed') ? null : `/operations/kyc-queue/${id}`),
};

export function AuditRowExpanded({ event, onScopeToEntity }: AuditRowExpandedProps) {
  const [contextOpen, setContextOpen] = useState(true);
  const navigate = useNavigate();
  const entityCopy = useCopyFeedback();
  const contextCopy = useCopyFeedback();

  const related = countRelatedEvents(event.entity.id, event.id);
  const linker = ENTITY_LINK[event.entity.type];
  const link = linker?.(event.entity.id) ?? null;

  return (
    <div className="bg-muted/40 border-t border-border">
      <div className="px-4 md:px-6 py-4 grid gap-4 md:grid-cols-2 text-sm">
        <KeyValue label={t('admin.audit-log.expanded.timestamp')}>
          <span className="font-mono tabular tabular-nums">
            {formatDateTime(event.timestamp)} <span className="text-muted-foreground">UTC</span>
          </span>
        </KeyValue>

        <KeyValue label={t('admin.audit-log.expanded.actor')}>
          <ActorBlock event={event} />
        </KeyValue>

        <KeyValue label={t('admin.audit-log.expanded.entity')}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-foreground/80">
              {t(`admin.audit-log.entity-type.${event.entity.type}`)}
            </span>
            <span className="text-muted-foreground">·</span>
            <code className="font-mono text-sm bg-card border border-border rounded px-1.5 py-0.5">
              {event.entity.id}
            </code>
            <button
              type="button"
              onClick={() => entityCopy.copy(event.entity.id)}
              aria-label={t('admin.audit-log.expanded.copy-entity')}
              aria-live="polite"
              className={cn(
                'transition-colors',
                entityCopy.copied
                  ? 'text-success-700 dark:text-success-600'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {entityCopy.copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            {link && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(link)}
                className="h-7 px-2 text-sm"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {t('admin.audit-log.expanded.open-entity')}
              </Button>
            )}
          </div>
        </KeyValue>

        {event.reason && (
          <KeyValue label={t('admin.audit-log.expanded.reason')}>
            <span className="text-foreground/90">{event.reason}</span>
          </KeyValue>
        )}
      </div>

      <div className="px-4 md:px-6 pb-4">
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <button
              type="button"
              onClick={() => setContextOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90 hover:text-foreground"
            >
              {contextOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
              {t('admin.audit-log.expanded.context')}
            </button>
            <button
              type="button"
              onClick={() => contextCopy.copy(formatContextJson(event.context))}
              aria-live="polite"
              className={cn(
                'inline-flex items-center gap-1 text-sm transition-colors',
                contextCopy.copied
                  ? 'text-success-700 dark:text-success-600'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {contextCopy.copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('admin.audit-log.expanded.copied')}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('admin.audit-log.expanded.copy-context')}
                </>
              )}
            </button>
          </div>
          {contextOpen && (
            <pre
              className={cn(
                'm-0 px-3 py-2.5 font-mono text-sm leading-relaxed text-foreground/90',
                'overflow-x-auto overflow-y-hidden whitespace-pre',
              )}
            >
              <code>{formatContextJson(event.context)}</code>
            </pre>
          )}
        </div>

        {related > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onScopeToEntity(event.entity.id)}
              className="text-sm"
            >
              {t('admin.audit-log.expanded.related', { count: related })}
              <span aria-hidden="true" className="ml-1">→</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ActorBlock({ event }: { event: AuditEvent }) {
  const a = event.actor;
  const lines: Array<{ label: string; value: string }> = [];
  if (a.name) lines.push({ label: t('admin.audit-log.expanded.actor-name'), value: a.name });
  if (a.id && a.id !== a.name) lines.push({ label: t('admin.audit-log.expanded.actor-id'), value: a.id });
  if (a.phone) lines.push({ label: t('admin.audit-log.expanded.actor-phone'), value: a.phone });
  if (a.ip) lines.push({ label: t('admin.audit-log.expanded.actor-ip'), value: a.ip });
  if (a.device) lines.push({ label: t('admin.audit-log.expanded.actor-device'), value: a.device });
  if (lines.length === 0) {
    return (
      <span className="text-muted-foreground italic">
        {t(`admin.audit-log.actor-type.${event.actorType}`)}
      </span>
    );
  }
  return (
    <ul className="space-y-0.5 text-sm">
      {lines.map((l) => (
        <li key={l.label} className="flex items-baseline gap-2">
          <span className="text-muted-foreground min-w-[64px]">{l.label}</span>
          <span className="font-mono">{l.value}</span>
        </li>
      ))}
    </ul>
  );
}
