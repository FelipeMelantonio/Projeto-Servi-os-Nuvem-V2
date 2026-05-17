import { getProducts } from '@/lib/api';
import ProductCatalog from '@/components/ProductCatalog';

export default async function ProductsPage() {
  let products = [];
  let error = '';

  try {
    products = await getProducts();
  } catch {
    error = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8080.';
  }

  return <ProductCatalog products={products} error={error} />;
}
