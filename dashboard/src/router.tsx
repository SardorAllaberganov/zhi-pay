import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Overview } from '@/pages/Overview';
import { Placeholder } from '@/pages/Placeholder';

const PLACEHOLDER_ROUTES = [
  '/transfers',
  '/kyc-queue',
  '/aml-triage',
  '/users',
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
        {PLACEHOLDER_ROUTES.map((path) => (
          <Route key={path} path={path} element={<Placeholder />} />
        ))}
        <Route path="*" element={<Placeholder />} />
      </Routes>
    </AppShell>
  );
}
