'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import type { Order } from '@/lib/types';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAGO:      'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDENTE:  'bg-amber-100  text-amber-700  border-amber-200',
    CANCELADO: 'bg-red-100    text-red-700    border-red-200',
  };
  const icons: Record<string, string> = {
    PAGO:      '✓',
    PENDENTE:  '⏳',
    CANCELADO: '✗',
  };
  const cls = styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {icons[status] ?? ''} {status}
    </span>
  );
}

export default function OrdersPage() {
  const { sessionId } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    getOrders(sessionId)
      .then(setOrders)
      .catch(() => setError('Erro ao carregar pedidos'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (!sessionId || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium">Nenhum pedido realizado ainda</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">Pedido #{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {order.items.map(item => (
                  <span key={item.id} className="mr-3">
                    {item.product.name} ×{item.quantity}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 mr-2">Código:</span>
                  <span className="font-mono text-sm font-bold text-blue-700">{order.paymentCode}</span>
                </div>
                <span className="font-bold text-gray-800">R$ {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
