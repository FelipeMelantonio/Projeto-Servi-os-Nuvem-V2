'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import AddToCartButton from './AddToCartButton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const CATEGORY_ICONS: Record<string, string> = {
  'Computadores':   '💻',
  'Smartphones':    '📱',
  'Periféricos':    '🖱️',
  'Armazenamento':  '💾',
  'Acessórios':     '🔌',
  'Áudio & Vídeo':  '🎧',
};

function categoryIcon(cat: string | null) {
  return cat ? (CATEGORY_ICONS[cat] ?? '📦') : '📦';
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0)
    return <span className="text-xs font-semibold text-red-500">Sem estoque</span>;
  if (qty <= 5)
    return <span className="text-xs font-semibold text-amber-500">⚠ Últimas {qty} unidades</span>;
  return <span className="text-xs font-semibold text-emerald-600">✓ {qty} em estoque</span>;
}

interface Props {
  products: Product[];
  error: string;
}

export default function ProductCatalog({ products, error }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const categories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean) as string[])
  ).sort();

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} produtos disponíveis</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Cadastrar Produto
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm mb-6 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Busca */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Filtros por categoria */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeCategory === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {categoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de produtos */}
      {filtered.length === 0 && !error ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-medium">Nenhum produto encontrado</p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-2 text-blue-500 hover:underline text-sm">
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Imagem ou ícone */}
              <div className="h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 transition-colors">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${API_BASE}${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{categoryIcon(product.category)}</span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1 gap-2">
                {product.category && (
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    {product.category}
                  </span>
                )}

                <h2 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                  {product.name}
                </h2>

                {product.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-xl font-bold text-blue-700">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <StockBadge qty={product.stockQuantity} />
                  </div>
                  <AddToCartButton productId={product.id} stockQuantity={product.stockQuantity} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
