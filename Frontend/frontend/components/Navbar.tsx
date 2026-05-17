import Link from 'next/link';
import CartBadge from './CartBadge';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
          <span className="text-2xl">🛒</span>
          <span>Cloud<span className="text-blue-600">Cart</span></span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            Produtos
          </Link>
          <Link
            href="/products/new"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            Cadastrar
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            Pedidos
          </Link>
          <Link
            href="/report"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            Relatório
          </Link>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <CartBadge />
        </div>
      </div>
    </nav>
  );
}
