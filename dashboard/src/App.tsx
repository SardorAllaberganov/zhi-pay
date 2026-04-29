import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Router } from '@/router';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="zhipay-theme">
      <BrowserRouter>
        <Router />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}
