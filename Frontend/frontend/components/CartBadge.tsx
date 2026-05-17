'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartBadge() {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
    >
      <span className="text-lg">🛒</span>
      <span>Carrinho</span>
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}
