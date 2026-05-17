'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCart } from './api';

interface CartContextValue {
  sessionId: string;
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let id = localStorage.getItem('cc-session-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('cc-session-id', id);
    }
    setSessionId(id);
  }, []);

  const refreshCartCount = useCallback(async () => {
    if (!sessionId) return;
    try {
      const items = await getCart(sessionId);
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }, [sessionId]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ sessionId, cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
