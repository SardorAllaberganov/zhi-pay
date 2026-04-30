import { useEffect, useState } from 'react';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, maskPinfl, maskDocNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  appendKycAudit,
  CURRENT_ADMIN,
  type KycReview,
} from '@/data/mockKycQueue';

interface DocumentImageCardProps {
  review: KycReview;
}

export function DocumentImageCard({ review }: DocumentImageCardProps) {
  const [faceRevealed, setFaceRevealed] = useState(false);
  const [docRevealed, setDocRevealed] = useState(false);

  // Reset reveal state when navigating between reviews — never carry
  // sensitive overlay state across rows.
  useEffect(() => {
    setFaceRevealed(false);
    setDocRevealed(false);
  }, [review.id]);

  function toggleFace() {
    const next = !faceRevealed;
    setFaceRevealed(next);
    appendKycAudit({
      reviewId: review.id,
      action: next ? 'reveal_face' : 'hide_face',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
    });
  }

  function toggleDoc() {
    const next = !docRevealed;
    setDocRevealed(next);
    appendKycAudit({
      reviewId: review.id,
      action: next ? 'reveal_doc_number' : 'hide_doc_number',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
    });
  }

  if (!review.documentImageUrl) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle>{t('admin.kyc-queue.detail.document-image')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {t('admin.kyc-queue.detail.document-image.no-image')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>{t('admin.kyc-queue.detail.document-image')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Sensitive banner */}
        <div className="flex items-start gap-2 rounded-md border border-warning-600/30 bg-warning-50 dark:bg-warning-700/15 p-2.5">
          <ShieldAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-warning-700 dark:text-warning-600"
            aria-hidden="true"
          />
          <span className="text-sm text-warning-700 dark:text-warning-600">
            {t('admin.kyc-queue.detail.document-image.banner')}
          </span>
        </div>

        {/* Document scan placeholder — minimal UZ ID layout */}
        <UzIdCardPlaceholder
          review={review}
          faceRevealed={faceRevealed}
          docRevealed={docRevealed}
        />

        {/* Reveal toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={toggleFace}>
            {faceRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {t('admin.kyc-queue.detail.document-image.hide-face')}
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {t('admin.kyc-queue.detail.document-image.show-face')}
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={toggleDoc}>
            {docRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {t('admin.kyc-queue.detail.document-image.hide-doc-number')}
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {t('admin.kyc-queue.detail.document-image.show-doc-number')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// UZ ID card — minimal placeholder
//
// Clean, structural representation: title row, photo on left, populated
// bilingual UZ/EN fields on the right. No flag, no emblem, no guilloche,
// no watermark — just the data structure. Two redaction overlays (face +
// ID number) toggle into place via the parent's controls.
// =====================================================================

interface PlaceholderProps {
  review: KycReview;
  faceRevealed: boolean;
  docRevealed: boolean;
}

function UzIdCardPlaceholder({ review, faceRevealed, docRevealed }: PlaceholderProps) {
  const { surname, given } = splitName(review.myidFullName);
  const dobLabel = formatUzDate(review.dob);
  const idNumberMasked = maskPinfl(review.pinfl);
  const docSeriesMasked = maskDocNumber(review.documentNumber);

  return (
    <div
      className="rounded-md border border-border bg-muted/30 dark:bg-muted/20 select-none overflow-hidden"
      aria-label={t('admin.kyc-queue.detail.document-image.placeholder-label')}
      role="img"
    >
      {/* Title strip */}
      <div className="border-b border-border px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
        Identity card · Republic of Uzbekistan
      </div>

      {/* Body — photo + fields */}
      <div className="flex gap-4 p-4">
        <PhotoBox revealed={faceRevealed} />

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          <Field
            label="Familiya / Surname"
            value={surname || '—'}
          />
          <Field
            label="Ismi / Given name(s)"
            value={given || '—'}
          />
          <Field
            label="Tug'ilgan sanasi / Date of birth"
            value={dobLabel}
            mono
          />
          <Field
            label={review.documentType === 'passport' ? 'Passport series / Hujjat raqami' : 'Card series / Hujjat raqami'}
            value={docSeriesMasked}
            mono
          />
          <Field
            label="Shaxsiy raqami / ID number"
            value={
              <span className="relative inline-block">
                <span className="font-mono tabular">{idNumberMasked}</span>
                {!docRevealed && <BlurChip />}
              </span>
            }
            spanFull
          />
        </div>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function PhotoBox({ revealed }: { revealed: boolean }) {
  return (
    <div className="relative aspect-[3/4] w-24 sm:w-28 shrink-0 rounded-sm bg-background ring-1 ring-border overflow-hidden">
      <svg
        viewBox="0 0 60 80"
        className="absolute inset-0 h-full w-full text-muted-foreground/40"
        aria-hidden="true"
      >
        <circle cx="30" cy="28" r="13" fill="currentColor" />
        <path
          d="M5 80 C 8 60, 18 48, 30 48 C 42 48, 52 60, 55 80 Z"
          fill="currentColor"
        />
      </svg>
      {!revealed && (
        <div
          className="absolute inset-0 backdrop-blur-md bg-foreground/30 dark:bg-black/55 flex items-center justify-center"
          aria-label="Face redacted"
        >
          <Eye className="h-4 w-4 text-white/90" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function BlurChip() {
  return (
    <span
      className="absolute inset-0 -m-1 rounded-sm backdrop-blur-md bg-foreground/30 dark:bg-black/50"
      aria-label="Document number redacted"
    />
  );
}

interface FieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  spanFull?: boolean;
}

function Field({ label, value, mono, spanFull }: FieldProps) {
  return (
    <div className={cn('min-w-0', spanFull && 'sm:col-span-2')}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5 truncate">
        {label}
      </div>
      <div
        className={cn(
          'text-sm font-semibold text-foreground/90 truncate',
          mono && 'font-mono tabular',
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ---------- helpers ----------

function splitName(name: string): {
  surname: string;
  given: string;
} {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { surname: '', given: parts[0] };
  return {
    given: parts[0],
    surname: parts[parts.length - 1],
  };
}

function formatUzDate(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
