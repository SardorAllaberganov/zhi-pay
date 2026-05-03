import { MaintenanceState } from '@/components/system/MaintenanceState';

/**
 * Full-page maintenance state. Rendered by the `<MaintenanceGate>` in
 * the router when `useMaintenanceState().active` is true — replaces
 * the entire shell (no sidebar, no topbar).
 *
 * Trigger paths:
 *   - `?maintenance=on` URL param at boot (preview / QA)
 *   - `enterMaintenance({ estimatedEndAt })` programmatic call (future
 *     ops admin surface)
 */
export function Maintenance() {
  return <MaintenanceState />;
}
