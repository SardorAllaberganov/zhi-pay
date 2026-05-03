import type { ServiceFull } from '@/data/mockServices';
import { ServiceTile, ServiceTileSkeleton } from './ServiceTile';

interface ServicesGridProps {
  services: ServiceFull[];
  /**
   * `pane` (default) — rendered inside the desktop list pane OR as the
   * mobile no-detail list. Tiles always stack in a single column so each
   * gets the full pane width. Selected-tile highlight pulls from `:id` in
   * the URL.
   */
  loading?: boolean;
}

/**
 * Single-column vertical list of service tiles. Rendered inside the desktop
 * master-detail list pane (`lg:w-[380px]`) on `lg+` and as the mobile
 * full-width list on `<lg` — same component, same density at every
 * breakpoint, so the tile content always has comfortable horizontal room.
 */
export function ServicesGrid({ services, loading = false }: ServicesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ServiceTileSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3">
      {services.map((s) => (
        <ServiceTile key={s.id} service={s} />
      ))}
    </div>
  );
}
