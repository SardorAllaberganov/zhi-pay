import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandlers {
  onCommandPalette?: () => void;
  onHelp?: () => void;
  onToggleTheme?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (TYPING_TAGS.includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Global keyboard shortcuts.
 *
 * ⌘K / Ctrl+K → command palette
 * g + o       → /
 * g + t       → /transfers
 * g + k       → /kyc-queue
 * g + a       → /aml-triage
 * g + u       → /users
 * /           → focus search
 * t           → toggle theme
 * ?           → help overlay
 * Esc         → close modal/sheet
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate();
  const lastKey = useRef<string | null>(null);
  const lastKeyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // ⌘K / Ctrl+K — command palette (always works, even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      // Esc always works
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      if (isTypingContext(e.target)) return;

      // ? — help
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        handlers.onHelp?.();
        return;
      }

      // / — focus search
      if (e.key === '/') {
        e.preventDefault();
        handlers.onSearch?.();
        return;
      }

      // t — toggle theme
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (lastKey.current === 'g') {
          // Already handled by g+t
        } else {
          handlers.onToggleTheme?.();
          return;
        }
      }

      // g + <key> sequences
      if (lastKey.current === 'g') {
        if (e.key === 'o') navigate('/');
        else if (e.key === 't') navigate('/operations/transfers');
        else if (e.key === 'k') navigate('/operations/kyc-queue');
        else if (e.key === 'a') navigate('/operations/aml-triage');
        else if (e.key === 'u') navigate('/customers/users');
        else if (e.key === 'c') navigate('/customers/cards');
        else if (e.key === 'r') navigate('/customers/recipients');
        else if (e.key === 'f') navigate('/finance/fx-config');
        else if (e.key === 'm') navigate('/finance/commissions');
        else if (e.key === 's') navigate('/system/services');
        else if (e.key === 'v') navigate('/system/app-versions');
        else if (e.key === 'e') navigate('/system/error-codes');
        else if (e.key === 'l') navigate('/compliance/audit-log');
        else if (e.key === 'b') navigate('/compliance/blacklist');
        else if (e.key === 'n') navigate('/notifications');
        lastKey.current = null;
        if (lastKeyTimeoutRef.current) window.clearTimeout(lastKeyTimeoutRef.current);
        return;
      }

      if (e.key === 'g') {
        lastKey.current = 'g';
        if (lastKeyTimeoutRef.current) window.clearTimeout(lastKeyTimeoutRef.current);
        lastKeyTimeoutRef.current = window.setTimeout(() => {
          lastKey.current = null;
        }, 1000);
        return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (lastKeyTimeoutRef.current) window.clearTimeout(lastKeyTimeoutRef.current);
    };
  }, [handlers, navigate]);
}
