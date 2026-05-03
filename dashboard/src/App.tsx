import { HashRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Router } from '@/router';
import { bootPreferences } from '@/lib/preferences';

// Apply persisted density / tabular-numerals to <html> at module load
// so the first paint reflects the user's stored preferences.
bootPreferences();

// HashRouter — works on GitHub Pages without a 404.html SPA-redirect
// shim. URLs look like `/#/operations/transfers/t_01`. Switch to
// BrowserRouter + the spa-github-pages 404 trick if/when clean URLs
// are required.
export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="zhipay-theme">
      <HashRouter>
        <Router />
        <Toaster richColors position="top-right" />
      </HashRouter>
    </ThemeProvider>
  );
}
