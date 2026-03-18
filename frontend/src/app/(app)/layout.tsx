import { LayoutClient } from '@/components/layout';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutClient>{children}</LayoutClient>
    </ThemeProvider>
  );
}

