import Link from 'next/link';
import { getOrder } from '@/lib/api';

export default async function CheckoutSuccessPage(props: PageProps<'/checkout/[orderId]'>) {
  const { orderId } = await props.params;

  let order;
  try {
    order = await getOrder(parseInt(orderId));
  } catch {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-gray-500">Pedido não encontrado.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Voltar para produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header verde */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center text-white">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-bold mb-1">Pedido Confirmado!</h1>
          <p className="text-emerald-100 text-sm">Pedido #{order.id} realizado com sucesso</p>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Código de pagamento */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">
              Código de Pagamento
            </p>
            <p className="text-4xl font-mono font-bold text-blue-700 tracking-widest">
              {order.paymentCode}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Apresente este código para simular o pagamento
            </p>
          </div>

          {/* Resumo dos itens */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Itens do Pedido</h2>
            <div className="flex flex-col gap-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-gray-800 font-medium">{item.product.name}</span>
                    <span className="text-gray-400 ml-2">×{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center font-bold text-base mt-3 pt-3 border-t border-gray-100">
              <span>Total pago</span>
              <span className="text-blue-700 text-lg">
                {order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/orders"
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Meus Pedidos
            </Link>
            <Link
              href="/"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors text-center"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
