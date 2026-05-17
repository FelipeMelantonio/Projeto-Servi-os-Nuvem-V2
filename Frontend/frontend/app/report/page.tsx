'use client';

import { useEffect, useState } from 'react';

interface ReportData {
  produtos: {
    total: number;
    semEstoque: number;
    estoqueBaixo: number;
    precoMedio: string;
    porCategoria: Record<string, number>;
  };
  pedidos: {
    total: number;
    receitaTotal: string;
    ticketMedio: string;
    produtoMaisVendido: string;
  };
  geradoEm: string;
}

const REPORT_URL = process.env.NEXT_PUBLIC_REPORT_URL ?? '';

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(REPORT_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o relatório. Verifique se a Lambda está ativa.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReport(); }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerado pela AWS Lambda via API Gateway</p>
        </div>
        <button
          onClick={loadReport}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : '↻'} Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm mb-6 flex gap-2">
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold">Erro ao carregar relatório</p>
            <p className="mt-0.5">{error}</p>
            <p className="mt-1 text-red-500">Configure <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_REPORT_URL</code> com a URL da Lambda no API Gateway.</p>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600" />
            <span className="text-sm">Consultando Lambda...</span>
          </div>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-5">
          {/* Cards de produtos */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Produtos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon="📦" label="Total" value={String(data.produtos.total)} color="blue" />
              <StatCard icon="🚫" label="Sem estoque" value={String(data.produtos.semEstoque)} color="red" />
              <StatCard icon="⚠️" label="Estoque baixo" value={String(data.produtos.estoqueBaixo)} color="amber" />
              <StatCard icon="💲" label="Preço médio" value={data.produtos.precoMedio} color="green" />
            </div>
          </section>

          {/* Cards de pedidos */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Pedidos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard icon="🧾" label="Total de pedidos" value={String(data.pedidos.total)} color="blue" />
              <StatCard icon="💰" label="Receita total" value={data.pedidos.receitaTotal} color="green" />
              <StatCard icon="📊" label="Ticket médio" value={data.pedidos.ticketMedio} color="purple" />
            </div>
            <div className="mt-3 bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Produto mais vendido</p>
                <p className="font-bold text-gray-800">{data.pedidos.produtoMaisVendido}</p>
              </div>
            </div>
          </section>

          {/* Produtos por categoria */}
          {Object.keys(data.produtos.porCategoria).length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Por Categoria</h2>
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                {Object.entries(data.produtos.porCategoria)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, qty], i, arr) => (
                    <div
                      key={cat}
                      className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <span className="text-sm text-gray-700">{cat}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(qty / data.produtos.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-800 w-6 text-right">{qty}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          <p className="text-xs text-gray-400 text-center">
            Gerado em {new Date(data.geradoEm).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: string; label: string; value: string;
  color: 'blue' | 'red' | 'amber' | 'green' | 'purple';
}) {
  const colors = {
    blue:   'bg-blue-50   border-blue-100   text-blue-700',
    red:    'bg-red-50    border-red-100    text-red-700',
    amber:  'bg-amber-50  border-amber-100  text-amber-700',
    green:  'bg-emerald-50 border-emerald-100 text-emerald-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  };
  return (
    <div className={`border rounded-xl p-4 shadow-sm ${colors[color]}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
