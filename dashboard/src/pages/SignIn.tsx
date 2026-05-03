import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { SessionExpiredBanner } from '@/components/auth/SessionExpiredBanner';
import { EmailPasswordStep } from '@/components/auth/EmailPasswordStep';
import { getSession } from '@/lib/auth';
import { DEMO_PASSWORD } from '@/data/mockAdminAuth';
import { t } from '@/lib/i18n';

/**
 * /sign-in surface.
 *
 * Email + password only — no 2FA on the admin surface (TOTP / SMS-OTP
 * belongs to the mobile end-user flow). Reads `?next=` for post-login
 * redirect and `?expired=1` for the session-expired banner.
 */
export function SignIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const next = params.get('next') ?? '/';
  const expired = params.get('expired') === '1';

  // If a valid session already exists when /sign-in is mounted, bounce
  // straight to `next`. Avoids a "Sign in again" pulse when an admin
  // clicks a stale /sign-in link in another tab.
  useEffect(() => {
    if (getSession()) {
      navigate(next, { replace: true });
    }
    // mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSuccess() {
    const session = getSession();
    if (!session) return;
    toast.success(t('admin.sign-in.toast.welcome', { name: session.profile.displayName }));
    navigate(next, { replace: true });
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t('admin.sign-in.title')}
        subtitle={t('admin.sign-in.subtitle')}
        banner={expired ? <SessionExpiredBanner /> : null}
      >
        <EmailPasswordStep
          defaultEmail="super.admin@zhipay.uz"
          defaultPassword={DEMO_PASSWORD}
          onSuccess={handleSuccess}
        />
      </AuthCard>
    </AuthLayout>
  );
}
