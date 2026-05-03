import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Overview } from '@/pages/Overview';
import { Transfers } from '@/pages/Transfers';
import { TransferDetail } from '@/pages/TransferDetail';
import { KycQueue } from '@/pages/KycQueue';
import { AmlTriage } from '@/pages/AmlTriage';
import { AmlTriageNew } from '@/pages/AmlTriageNew';
import { Users } from '@/pages/Users';
import { UserDetail } from '@/pages/UserDetail';
import { Cards } from '@/pages/Cards';
import { CardDetail } from '@/pages/CardDetail';
import { Recipients } from '@/pages/Recipients';
import { RecipientDetail } from '@/pages/RecipientDetail';
import { FxConfig } from '@/pages/FxConfig';
import { FxConfigUpdate } from '@/pages/FxConfigUpdate';
import { CommissionRules } from '@/pages/CommissionRules';
import { CommissionRulesNew } from '@/pages/CommissionRulesNew';
import { AuditLog } from '@/pages/AuditLog';
import { Blacklist } from '@/pages/Blacklist';
import { BlacklistNew } from '@/pages/BlacklistNew';
import { BlacklistDetail } from '@/pages/BlacklistDetail';
import { KycTiers } from '@/pages/KycTiers';
import { Services } from '@/pages/Services';
import { AppVersions } from '@/pages/AppVersions';
import { ErrorCodes } from '@/pages/ErrorCodes';
import { Stories } from '@/pages/Stories';
import { StoryEditor } from '@/pages/StoryEditor';
import { News } from '@/pages/News';
import { NewsEditor } from '@/pages/NewsEditor';
import { Notifications } from '@/pages/Notifications';
import { NotificationsCompose } from '@/pages/NotificationsCompose';
import { SentNotificationDetail } from '@/pages/SentNotificationDetail';
import { Placeholder } from '@/pages/Placeholder';

const PLACEHOLDER_ROUTES: string[] = [];

function RedirectPreservingQuery({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

export function Router() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />

        {/* Operations — Transfers (nested) */}
        <Route path="/operations/transfers" element={<Transfers />} />
        <Route path="/operations/transfers/:id" element={<TransferDetail />} />

        {/* Operations — KYC Queue (nested) */}
        <Route path="/operations/kyc-queue" element={<KycQueue />} />
        <Route path="/operations/kyc-queue/:id" element={<KycQueue />} />

        {/* Operations — AML Triage (nested) */}
        <Route path="/operations/aml-triage" element={<AmlTriage />} />
        <Route path="/operations/aml-triage/new" element={<AmlTriageNew />} />
        <Route path="/operations/aml-triage/:id" element={<AmlTriage />} />

        {/* Customers — Users (nested) */}
        <Route path="/customers/users" element={<Users />} />
        <Route path="/customers/users/:id" element={<UserDetail />} />

        {/* Customers — Cards (nested) */}
        <Route path="/customers/cards" element={<Cards />} />
        <Route path="/customers/cards/:id" element={<CardDetail />} />

        {/* Customers — Recipients (nested) */}
        <Route path="/customers/recipients" element={<Recipients />} />
        <Route path="/customers/recipients/:id" element={<RecipientDetail />} />

        {/* Finance — FX Config (nested) */}
        <Route path="/finance/fx-config" element={<FxConfig />} />
        <Route path="/finance/fx-config/new" element={<FxConfigUpdate />} />

        {/* Finance — Commission Rules (nested) */}
        <Route path="/finance/commissions" element={<CommissionRules />} />
        <Route path="/finance/commissions/new" element={<CommissionRulesNew />} />

        {/* Compliance — Audit Log (nested) */}
        <Route path="/compliance/audit-log" element={<AuditLog />} />

        {/* Compliance — Blacklist (nested) */}
        <Route path="/compliance/blacklist" element={<Blacklist />} />
        <Route path="/compliance/blacklist/new" element={<BlacklistNew />} />
        <Route path="/compliance/blacklist/:id" element={<BlacklistDetail />} />

        {/* Compliance — KYC Tiers (nested, read-only reference) */}
        <Route path="/compliance/kyc-tiers" element={<KycTiers />} />

        {/* System — Services & Health (nested) */}
        <Route path="/system/services" element={<Services />} />
        <Route path="/system/services/:id" element={<Services />} />

        {/* System — App Versions (nested) */}
        <Route path="/system/app-versions" element={<AppVersions />} />

        {/* System — Error Codes (read-only catalog) */}
        <Route path="/system/error-codes" element={<ErrorCodes />} />

        {/* Content — Stories (CMS) */}
        <Route path="/content/stories" element={<Stories />} />
        <Route path="/content/stories/new" element={<StoryEditor />} />
        <Route path="/content/stories/:id" element={<StoryEditor />} />

        {/* Content — News (CMS) */}
        <Route path="/content/news" element={<News />} />
        <Route path="/content/news/new" element={<NewsEditor />} />
        <Route path="/content/news/:id" element={<NewsEditor />} />

        {/* Content — Notifications (admin composer + sent history) */}
        <Route path="/content/notifications" element={<Notifications />} />
        <Route path="/content/notifications/new" element={<NotificationsCompose />} />
        <Route
          path="/content/notifications/sent/:id"
          element={<SentNotificationDetail />}
        />

        {/* Back-compat redirects: anything that still links to /transfers/* lands on the nested route. */}
        <Route path="/transfers" element={<Navigate to="/operations/transfers" replace />} />
        <Route
          path="/transfers/:id"
          element={<Navigate to="/operations/transfers" replace />}
        />
        <Route path="/kyc-queue" element={<Navigate to="/operations/kyc-queue" replace />} />
        <Route path="/aml-triage" element={<Navigate to="/operations/aml-triage" replace />} />
        <Route path="/users" element={<Navigate to="/customers/users" replace />} />
        <Route path="/users/:id" element={<Navigate to="/customers/users" replace />} />
        <Route path="/cards" element={<Navigate to="/customers/cards" replace />} />
        <Route path="/cards/:id" element={<Navigate to="/customers/cards" replace />} />
        <Route path="/recipients" element={<Navigate to="/customers/recipients" replace />} />
        <Route path="/recipients/:id" element={<Navigate to="/customers/recipients" replace />} />
        <Route path="/fx-config" element={<Navigate to="/finance/fx-config" replace />} />
        <Route path="/fx-config/new" element={<Navigate to="/finance/fx-config/new" replace />} />
        <Route path="/commission-rules" element={<Navigate to="/finance/commissions" replace />} />
        <Route path="/commission-rules/new" element={<Navigate to="/finance/commissions/new" replace />} />
        <Route path="/audit-log" element={<Navigate to="/compliance/audit-log" replace />} />
        <Route path="/blacklist" element={<Navigate to="/compliance/blacklist" replace />} />
        <Route path="/blacklist/new" element={<RedirectPreservingQuery to="/compliance/blacklist/new" />} />
        <Route path="/kyc-tiers" element={<Navigate to="/compliance/kyc-tiers" replace />} />
        <Route path="/services" element={<Navigate to="/system/services" replace />} />
        <Route path="/services/:id" element={<Navigate to="/system/services" replace />} />
        <Route path="/app-versions" element={<RedirectPreservingQuery to="/system/app-versions" />} />
        <Route path="/error-codes" element={<RedirectPreservingQuery to="/system/error-codes" />} />
        <Route path="/stories" element={<Navigate to="/content/stories" replace />} />
        <Route path="/stories/new" element={<Navigate to="/content/stories/new" replace />} />
        <Route path="/stories/:id" element={<Navigate to="/content/stories" replace />} />
        <Route path="/news" element={<Navigate to="/content/news" replace />} />
        <Route path="/news/new" element={<Navigate to="/content/news/new" replace />} />
        <Route path="/news/:id" element={<Navigate to="/content/news" replace />} />
        <Route
          path="/notifications"
          element={<RedirectPreservingQuery to="/content/notifications" />}
        />

        {PLACEHOLDER_ROUTES.map((path) => (
          <Route key={path} path={path} element={<Placeholder />} />
        ))}
        <Route path="*" element={<Placeholder />} />
      </Routes>
    </AppShell>
  );
}
