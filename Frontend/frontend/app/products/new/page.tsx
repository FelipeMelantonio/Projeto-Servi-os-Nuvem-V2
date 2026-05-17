import Link from 'next/link';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Voltar
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Cadastrar Produto</h1>
        <ProductForm />
      </div>
    </div>
  );
}
