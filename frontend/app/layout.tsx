import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'HD Foods & Masale | Premium Spices & Authentic Taste',
  description: 'Experience the authentic taste of tradition with HD Foods & Masale. Premium quality spices and food products.',
};

import { CartProvider } from '@/lib/cart';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-stone-50 text-stone-900">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
