import type {Metadata} from 'next';
import { Montserrat, Cormorant_Garamond, Fira_Sans, Fira_Code } from 'next/font/google';
import './globals.css';

const sans = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const firaSans = Fira_Sans({
  subsets: ['latin'],
  variable: '--font-fira-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  weight: ['400', '500', '600', '700'],
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'HD Foods & Masale | Premium Spices & Authentic Taste',
  description: 'Experience the authentic taste of tradition with HD Foods & Masale. Premium quality spices and food products.',
};

import { CartProvider } from '@/lib/cart';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${firaSans.variable} ${firaCode.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-stone-50 text-stone-900">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
