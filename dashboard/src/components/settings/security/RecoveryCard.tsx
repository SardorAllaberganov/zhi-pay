import { LifeBuoy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth';
import { t } from '@/lib/i18n';

export function RecoveryCard() {
  const session = useSession();
  if (!session) return null;
  const contact = session.profile.recoveryContact;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('admin.settings.security.recovery.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('admin.settings.security.recovery.unavailable')}
        </p>
        {contact ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
            <span className="text-sm font-medium">
              {t('admin.settings.security.recovery.contact-label')}
            </span>
            <span className="font-mono text-sm text-foreground">{contact}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
