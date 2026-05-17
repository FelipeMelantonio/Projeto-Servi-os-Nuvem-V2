'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkout, getCart, removeFromCart, updateCartItem } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import type { CartItem } from '@/lib/types';

const CATEGORY_ICONS: Record<string, string> = {
  'Computadores':   '💻',
  'Smartphones':    '📱',
  'Periféricos':    '🖱️',
  'Armazenamento':  '💾',
  'Acessórios':     '🔌',
  'Áudio & Vídeo':  '🎧',
};

function productIcon(cat: string | null | undefined) {
  return cat ? (CATEGORY_ICONS[cat] ?? '📦') : '📦';
}

export default function CartView() {
  const router = useRouter();
  const { sessionId, refreshCartCount } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    if (!sessionId) return;
    try {
      setItems(await getCart(sessionId));
    } catch {
      setError('Erro ao carregar o carrinho');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function handleQuantity(productId: number, newQty: number) {
    if (!sessionId || updating !== null) return;
    setUpdating(productId);
    setError('');
    try {
      await updateCartItem(sessionId, productId, newQty);
      await loadCart();
      await refreshCartCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar quantidade');
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemove(productId: number) {
    if (!sessionId) return;
    setError('');
    try {
      await removeFromCart(sessionId, productId);
      await loadCart();
      await refreshCartCount();
    } catch {
      setError('Erro ao remover item');
    }
  }

  async function handleCheckout() {
    if (!sessionId) return;
    setCheckingOut(true);
    setError('');
    try {
      const order = await checkout(sessionId);
      await refreshCartCount();
      router.push(`/checkout/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar pedido');
      setCheckingOut(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!sessionId || loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600" />
          <span className="text-sm">Carregando carrinho...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-gray-400">
        <div className="text-7xl mb-4">🛒</div>
        <p className="text-xl font-semibold text-gray-600 mb-1">Seu carrinho está vazio</p>
        <p className="text-sm mb-6">Adicione produtos para continuar</p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Lista de itens */}
      <div className="flex-1 flex flex-col gap-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {items.map(item => (
          <div
            key={item.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4 items-center"
          >
            {/* Ícone */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl shrink-0">
              {productIcon(item.product.category)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
              {item.product.category && (
                <p className="text-xs text-blue-600 font-medium">{item.product.category}</p>
              )}
              <p className="text-sm text-gray-500 mt-0.5">
                {item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {item.quantity}
              </p>
            </div>

            {/* Controles de quantidade */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantity(item.product.id, item.quantity - 1)}
                disabled={updating === item.product.id}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center text-gray-600 font-bold transition-colors disabled:opacity-40"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-800">
                {updating === item.product.id ? (
                  <span className="inline-block w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : item.quantity}
              </span>
              <button
                onClick={() => handleQuantity(item.product.id, item.quantity + 1)}
                disabled={updating === item.product.id || item.quantity >= item.product.stockQuantity}
                className="w-7 h-7 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center text-gray-600 font-bold transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>

            {/* Subtotal do item */}
            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900 text-sm">
                {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <button
                onClick={() => handleRemove(item.product.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors mt-1"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo do pedido */}
      <div className="w-full lg:w-80 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sticky top-4">
        <h2 className="font-bold text-gray-800 mb-4">Resumo do Pedido</h2>

        <div className="flex flex-col gap-2 text-sm mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Itens ({totalItems})</span>
            <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frete</span>
            <span className="text-emerald-600 font-semibold">Grátis</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-blue-700 text-lg">
              {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
        >
          {checkingOut ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finalizando...
            </>
          ) : (
            '✓ Finalizar Pedido'
          )}
        </button>

        <Link
          href="/"
          className="block text-center text-sm text-blue-600 hover:underline mt-3"
        >
          ← Continuar comprando
        </Link>
      </div>
    </div>
  );
}
