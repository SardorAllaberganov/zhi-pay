import { ActiveSessionsList } from './ActiveSessionsList';
import { SignInHistoryCollapsible } from './SignInHistoryCollapsible';

export function SessionsTab() {
  return (
    <div className="space-y-6">
      <ActiveSessionsList />
      <SignInHistoryCollapsible />
    </div>
  );
}
