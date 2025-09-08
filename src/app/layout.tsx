import type { Metadata, Viewport } from 'next';
import { inter } from './fonts';
import { ThemeProvider } from '../components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoCrate - NX CAD Crate Generator',
  description: 'Professional shipping crate design and NX expression generator',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
