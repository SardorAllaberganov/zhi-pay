import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { checkPasswordStrength } from '@/data/mockAdminAuth';

interface PasswordStrengthMeterProps {
  password: string;
}

const RULE_KEY: Record<keyof ReturnType<typeof checkPasswordStrength>['rules'], string> = {
  length: 'admin.settings.security.password.rule.length',
  mixedCase: 'admin.settings.security.password.rule.mixed-case',
  number: 'admin.settings.security.password.rule.number',
  symbol: 'admin.settings.security.password.rule.symbol',
};

const SCORE_TONE: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-danger-600',
  2: 'bg-warning-600',
  3: 'bg-warning-600',
  4: 'bg-success-600',
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result = checkPasswordStrength(password);
  const rules = result.rules;

  return (
    <div className="space-y-3">
      {/* 4 bars */}
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              i <= result.score ? SCORE_TONE[result.score] : 'bg-muted',
            )}
          />
        ))}
      </div>

      {/* Rule list */}
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {(Object.keys(rules) as (keyof typeof rules)[]).map((key) => {
          const passed = rules[key];
          const Icon = passed ? Check : X;
          return (
            <li
              key={key}
              className={cn(
                'flex items-center gap-2 text-sm',
                passed ? 'text-success-700 dark:text-success-600' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t(RULE_KEY[key])}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
