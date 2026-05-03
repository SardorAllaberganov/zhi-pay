import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface EmailPasswordStepProps {
  /** Pre-fills the email field — used by the demo to seed `super.admin@zhipay.uz`. */
  defaultEmail?: string;
  /** Pre-fills the password field — used for fast demo access. */
  defaultPassword?: string;
  onSuccess: () => void;
}

export function EmailPasswordStep({
  defaultEmail = '',
  defaultPassword = '',
  onSuccess,
}: EmailPasswordStepProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setErrorKey(null);
    setPending(true);

    // Mock latency so the spinner has a chance to render — design probe
    // for the loading state.
    window.setTimeout(() => {
      const result = signIn(email, password);
      setPending(false);
      if (result.ok) {
        onSuccess();
      } else {
        const map: Record<string, string> = {
          AUTH_INVALID_CREDENTIALS: 'admin.sign-in.error.invalid',
          AUTH_RATE_LIMITED: 'admin.sign-in.error.rate-limited',
          AUTH_ACCOUNT_DISABLED: 'admin.sign-in.error.disabled',
          AUTH_NETWORK: 'admin.sign-in.error.network',
          AUTH_SERVER_ERROR: 'admin.sign-in.error.server',
        };
        setErrorKey(map[result.failureCode] ?? 'admin.sign-in.error.invalid');
      }
    }, 600);
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">{t('admin.sign-in.field.email')}</Label>
          <Input
            id="signin-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            autoFocus
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signin-password">{t('admin.sign-in.field.password')}</Label>
          <div className="relative">
            <Input
              id="signin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={pending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={pending}
              aria-label={t(
                showPassword ? 'admin.sign-in.field.password.hide' : 'admin.sign-in.field.password.show',
              )}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {errorKey ? (
          <div
            role="alert"
            aria-live="polite"
            className={cn(
              'rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive',
            )}
          >
            {t(errorKey)}
          </div>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('admin.sign-in.action.submitting')}</span>
            </>
          ) : (
            t('admin.sign-in.action.submit')
          )}
        </Button>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            {t('admin.sign-in.link.forgot')}
          </button>
        </div>
      </form>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </>
  );
}
