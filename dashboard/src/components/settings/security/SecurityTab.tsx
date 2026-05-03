import { PasswordCard } from './PasswordCard';
import { RecoveryCard } from './RecoveryCard';

/**
 * Security tab — Password card + Recovery card.
 *
 * **No 2FA card.** Admin auth is email + password only on this surface
 * per Phase 20 direction "the otp is for mobile auth"; the schema
 * (`docs/models.md` §10) documents the absence and this tab honors it.
 * If 2FA is reintroduced, a `<TwoFactorCard>` lands here between
 * Password and Recovery.
 */
export function SecurityTab() {
  return (
    <div className="space-y-6">
      <PasswordCard />
      <RecoveryCard />
    </div>
  );
}
