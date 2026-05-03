import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Self-service reset is intentionally not offered for compliance
 * reasons — admin password resets must go through an existing
 * super-admin (out-of-band).
 */
export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{t('admin.sign-in.forgot.title')}</DialogTitle>
          <DialogDescription>{t('admin.sign-in.forgot.body')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('admin.sign-in.forgot.ok')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
