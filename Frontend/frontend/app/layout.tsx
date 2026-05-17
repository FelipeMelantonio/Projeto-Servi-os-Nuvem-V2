import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/lib/cart-context';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CloudCart — Loja Online',
  description: 'Sistema de Carrinho de Compras em Nuvem',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[var(--font-geist),system-ui,sans-serif] antialiased">
        <CartProvider>
          <Navbar />
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-100 bg-white py-4 text-center text-xs text-gray-400 mt-8">
            CloudCart • Projeto de Serviços em Nuvem 2026
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
