import { LayoutClient } from '@/components/layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}

