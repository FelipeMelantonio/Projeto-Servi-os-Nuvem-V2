'use client';

import { useState } from 'react';
import { addToCart } from '@/lib/api';
import { useCart } from '@/lib/cart-context';

interface Props {
  productId: number;
  stockQuantity: number;
}

export default function AddToCartButton({ productId, stockQuantity }: Props) {
  const { sessionId, refreshCartCount } = useCart();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleAdd() {
    if (!sessionId || stockQuantity === 0 || state === 'loading') return;
    setState('loading');
    try {
      await addToCart(sessionId, productId, 1);
      await refreshCartCount();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro');
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }

  if (stockQuantity === 0) {
    return (
      <span className="text-xs text-red-400 font-semibold px-3 py-1.5 border border-red-100 rounded-lg bg-red-50">
        Sem estoque
      </span>
    );
  }

  if (state === 'success') {
    return (
      <span className="text-xs text-emerald-600 font-semibold px-3 py-1.5 border border-emerald-200 rounded-lg bg-emerald-50 flex items-center gap-1">
        ✓ Adicionado
      </span>
    );
  }

  if (state === 'error') {
    return (
      <span className="text-xs text-red-500 font-semibold px-3 py-1.5 border border-red-200 rounded-lg bg-red-50 max-w-28 truncate" title={errorMsg}>
        ✗ {errorMsg}
      </span>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={state === 'loading' || !sessionId}
      className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
    >
      {state === 'loading' ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Adicionando</span>
        </>
      ) : (
        '+ Carrinho'
      )}
    </button>
  );
}
