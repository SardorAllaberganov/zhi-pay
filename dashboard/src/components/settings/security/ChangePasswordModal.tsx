import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { changeMyPassword } from '@/lib/auth';
import { checkPasswordStrength } from '@/data/mockAdminAuth';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [confirmAlertOpen, setConfirmAlertOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset on close
      setCurrent('');
      setNext('');
      setConfirm('');
      setShowCurrent(false);
      setShowNext(false);
      setConfirmAlertOpen(false);
    }
  }, [open]);

  const strong = checkPasswordStrength(next).ok;
  const matchesConfirm = next.length > 0 && next === confirm;
  const formValid = current.length > 0 && strong && matchesConfirm;

  const submit = () => {
    const result = changeMyPassword({ current, next });
    if (result.ok) {
      toast.success(
        result.revokedOthers > 0
          ? t('admin.settings.security.password.toast.changed-with-revoke').replace(
              '{n}',
              String(result.revokedOthers),
            )
          : t('admin.settings.security.password.toast.changed'),
      );
      onOpenChange(false);
    } else if (result.reason === 'wrong_current') {
      toast.error(t('admin.settings.security.password.toast.wrong-current'));
    } else if (result.reason === 'invalid_new') {
      toast.error(t('admin.settings.security.password.toast.invalid-new'));
    } else {
      toast.error(t('admin.settings.security.password.toast.error'));
    }
  };

  // Cmd/Ctrl+Enter submit when valid (per spec)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && formValid) {
      e.preventDefault();
      setConfirmAlertOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[480px]" onKeyDown={onKeyDown}>
          <DialogHeader>
            <DialogTitle>{t('admin.settings.security.password.modal.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.settings.security.password.modal.body')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <PasswordField
              id="cp-current"
              label={t('admin.settings.security.password.field.current')}
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              autoComplete="current-password"
              autoFocus
            />

            <PasswordField
              id="cp-next"
              label={t('admin.settings.security.password.field.new')}
              value={next}
              onChange={setNext}
              show={showNext}
              onToggleShow={() => setShowNext((v) => !v)}
              autoComplete="new-password"
            />

            {next.length > 0 ? <PasswordStrengthMeter password={next} /> : null}

            <PasswordField
              id="cp-confirm"
              label={t('admin.settings.security.password.field.confirm')}
              value={confirm}
              onChange={setConfirm}
              show={showNext}
              onToggleShow={() => setShowNext((v) => !v)}
              autoComplete="new-password"
              error={
                confirm.length > 0 && confirm !== next
                  ? t('admin.settings.security.password.field.confirm.mismatch')
                  : undefined
              }
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              disabled={!formValid}
              onClick={() => setConfirmAlertOpen(true)}
              aria-disabled={!formValid}
            >
              {t('admin.settings.security.password.action.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmAlertOpen} onOpenChange={setConfirmAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.settings.security.password.confirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.settings.security.password.confirm.signs-out')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={submit}>
              {t('admin.settings.security.password.confirm.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  autoFocus,
  error,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn('h-10 pr-10', error && 'border-danger-600 focus-visible:ring-danger-600')}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? t('admin.sign-in.field.password.hide') : t('admin.sign-in.field.password.show')}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center',
            'rounded text-muted-foreground hover:text-foreground hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
    </div>
  );
}
