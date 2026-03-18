import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zyper – Visual automation platform',
  description: 'Design, run and monitor automations with visual workflows, triggers, actions and execution history.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
