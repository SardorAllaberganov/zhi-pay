import type { Platform } from '@/data/mockAppVersions';
import { DEFAULT_SORT, type AppVersionSort } from './types';

/**
 * Per-platform UI state cached at module level so that switching tabs +
 * back-navigating from a future detail surface preserves sort + expanded
 * row across mounts. Same precedent as `components/blacklist/filterState.ts`
 * which keys per BlacklistType.
 */

interface PlatformUiState {
  sort: AppVersionSort;
  expandedId: string | null;
}

const initial = (): PlatformUiState => ({ sort: { ...DEFAULT_SORT }, expandedId: null });

let state: Record<Platform, PlatformUiState> = {
  ios: initial(),
  android: initial(),
};

export function getPlatformUiState(p: Platform): PlatformUiState {
  return state[p];
}

export function setPlatformUiState(p: Platform, next: PlatformUiState): void {
  state = { ...state, [p]: next };
}
