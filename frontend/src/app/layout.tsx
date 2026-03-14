import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { LayoutClient } from '@/components/layout';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Automation Platform',
  description: 'Mini-Zapier MVP — workflows, triggers, executions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen font-sans">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
