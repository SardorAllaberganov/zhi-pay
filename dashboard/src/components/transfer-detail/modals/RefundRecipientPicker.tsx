import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { CARDS } from '@/data/mock';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Card as UserCard } from '@/types';

export type RefundTarget = 'source' | 'alternate' | 'bank';

export interface BankAccount {
  name: string;
  holder: string;
  number: string;
}

export interface RefundRecipientValue {
  target: RefundTarget;
  alternateCardId?: string;
  bank?: BankAccount;
}

interface Props {
  userId: string;
  sourceCardId: string;
  sourceCardScheme: UserCard['scheme'];
  sourceCardMaskedPan: string;
  value: RefundRecipientValue;
  onChange: (next: RefundRecipientValue) => void;
}

const BANK_NAMES = ['Universalbank', 'Hamkorbank', 'Asakabank', 'Kapitalbank', "Ipak Yo'li Bank"];

export function RefundRecipientPicker({
  userId,
  sourceCardId,
  sourceCardScheme,
  sourceCardMaskedPan,
  value,
  onChange,
}: Props) {
  const otherCards = CARDS.filter(
    (c) => c.userId === userId && c.id !== sourceCardId && c.status === 'active',
  );

  function selectTarget(target: RefundTarget) {
    if (target === 'alternate') {
      onChange({
        target: 'alternate',
        alternateCardId: value.alternateCardId ?? otherCards[0]?.id,
      });
    } else if (target === 'bank') {
      onChange({
        target: 'bank',
        bank: value.bank ?? { name: BANK_NAMES[0], holder: '', number: '' },
      });
    } else {
      onChange({ target: 'source' });
    }
  }

  return (
    <fieldset className="space-y-2">
      <Label className="text-sm font-medium">
        {t('admin.transfer-detail.action.reverse.recipient.label')}
      </Label>
      <div className="space-y-2">
        <RadioRow
          checked={value.target === 'source'}
          onSelect={() => selectTarget('source')}
          name="refund-target"
        >
          <div className="flex items-center gap-2">
            <SchemeLogo scheme={sourceCardScheme} size="xs" />
            <span className="text-sm">
              {t('admin.transfer-detail.action.reverse.recipient.source-card')}
            </span>
            <MaskedPan value={sourceCardMaskedPan} scheme={sourceCardScheme} className="text-sm" />
          </div>
        </RadioRow>

        <RadioRow
          checked={value.target === 'alternate'}
          onSelect={() => selectTarget('alternate')}
          name="refund-target"
          disabled={otherCards.length === 0}
        >
          <div className="space-y-2 w-full">
            <span className="text-sm">
              {t('admin.transfer-detail.action.reverse.recipient.alternate-card')}
              {otherCards.length === 0 && (
                <span className="ml-2 text-sm text-muted-foreground">(none on file)</span>
              )}
            </span>
            {value.target === 'alternate' && otherCards.length > 0 && (
              <select
                value={value.alternateCardId}
                onChange={(e) => onChange({ ...value, alternateCardId: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {otherCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.bankName} — {c.maskedPan} ({c.scheme})
                  </option>
                ))}
              </select>
            )}
          </div>
        </RadioRow>

        <RadioRow
          checked={value.target === 'bank'}
          onSelect={() => selectTarget('bank')}
          name="refund-target"
        >
          <div className="space-y-2 w-full">
            <span className="text-sm">
              {t('admin.transfer-detail.action.reverse.recipient.external-bank')}
            </span>
            {value.target === 'bank' && (
              <div className="space-y-2 pt-1">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t('admin.transfer-detail.action.reverse.bank.name')}
                  </Label>
                  <select
                    value={value.bank?.name ?? BANK_NAMES[0]}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        bank: { ...(value.bank ?? { holder: '', number: '' }), name: e.target.value },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {BANK_NAMES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="bank-holder" className="text-xs text-muted-foreground">
                    {t('admin.transfer-detail.action.reverse.bank.holder')}
                  </Label>
                  <Input
                    id="bank-holder"
                    value={value.bank?.holder ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        bank: { ...(value.bank ?? { name: BANK_NAMES[0], number: '' }), holder: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-number" className="text-xs text-muted-foreground">
                    {t('admin.transfer-detail.action.reverse.bank.number')}
                  </Label>
                  <Input
                    id="bank-number"
                    value={value.bank?.number ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        bank: { ...(value.bank ?? { name: BANK_NAMES[0], holder: '' }), number: e.target.value },
                      })
                    }
                    className="mt-1 font-mono tabular"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}
          </div>
        </RadioRow>
      </div>
    </fieldset>
  );
}

export function isRecipientValid(v: RefundRecipientValue): boolean {
  if (v.target === 'source') return true;
  if (v.target === 'alternate') return !!v.alternateCardId;
  if (v.target === 'bank') {
    return !!v.bank && v.bank.holder.trim().length > 0 && v.bank.number.trim().length > 0;
  }
  return false;
}

interface RadioRowProps {
  checked: boolean;
  onSelect: () => void;
  name: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function RadioRow({ checked, onSelect, name, disabled, children }: RadioRowProps) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors',
        checked ? 'border-brand-600/60 bg-brand-50 dark:bg-brand-950/40' : 'border-border bg-background hover:bg-accent',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={() => !disabled && onSelect()}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 accent-brand-600"
      />
      <div className="flex-1 min-w-0">{children}</div>
    </label>
  );
}
