import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Overview } from '@/pages/Overview';
import { Transfers } from '@/pages/Transfers';
import { TransferDetail } from '@/pages/TransferDetail';
import { KycQueue } from '@/pages/KycQueue';
import { AmlTriage } from '@/pages/AmlTriage';
import { AmlTriageNew } from '@/pages/AmlTriageNew';
import { Users } from '@/pages/Users';
import { UserDetail } from '@/pages/UserDetail';
import { Placeholder } from '@/pages/Placeholder';

const PLACEHOLDER_ROUTES = [
  '/cards',
  '/recipients',
  '/fx-config',
  '/commission-rules',
  '/audit-log',
  '/blacklist',
  '/kyc-tiers',
  '/services',
  '/app-versions',
  '/error-codes',
  '/stories',
  '/news',
  '/notifications',
];

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

        {PLACEHOLDER_ROUTES.map((path) => (
          <Route key={path} path={path} element={<Placeholder />} />
        ))}
        <Route path="*" element={<Placeholder />} />
      </Routes>
    </AppShell>
  );
}
