/**
 * Lambda /report
 * Consome a API do backend via HTTP e devolve estatísticas em JSON.
 * Não acessa o RDS diretamente.
 *
 * Variável de ambiente obrigatória:
 *   API_URL — URL base do API Gateway, ex: https://abc123.execute-api.us-east-1.amazonaws.com/prod
 */
export const handler = async (event,context) => {
  const API_URL = process.env.API_URL;

  if (!API_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Variável API_URL não configurada' }),
    };
  }

  try {
    const [productsRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/orders/all`),
    ]);

    if (!productsRes.ok || !ordersRes.ok) {
      throw new Error('Falha ao consumir a API do backend');
    }

    const products = await productsRes.json();
    const orders   = await ordersRes.json();

    // --- Estatísticas de produtos ---
    const totalProdutos      = products.length;
    const semEstoque         = products.filter(p => p.stockQuantity === 0).length;
    const estoqueBaixo       = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
    const precoMedio         = totalProdutos > 0
      ? (products.reduce((s, p) => s + p.price, 0) / totalProdutos).toFixed(2)
      : '0.00';

    // --- Estatísticas de pedidos ---
    const totalPedidos  = orders.length;
    const receitaTotal  = orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2);
    const ticketMedio   = totalPedidos > 0
      ? (orders.reduce((s, o) => s + o.totalAmount, 0) / totalPedidos).toFixed(2)
      : '0.00';

    // --- Produto mais vendido ---
    const contagemProdutos = {};
    orders.forEach(order => {
      (order.items ?? []).forEach(item => {
        const nome = item.product?.name ?? 'Desconhecido';
        contagemProdutos[nome] = (contagemProdutos[nome] ?? 0) + item.quantity;
      });
    });
    const topEntry = Object.entries(contagemProdutos).sort((a, b) => b[1] - a[1])[0];
    const produtoMaisVendido = topEntry
      ? `${topEntry[0]} (${topEntry[1]} unidades)`
      : 'Nenhum pedido ainda';

    // --- Categorias ---
    const porCategoria = {};
    products.forEach(p => {
      const cat = p.category ?? 'Sem categoria';
      porCategoria[cat] = (porCategoria[cat] ?? 0) + 1;
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        produtos: {
          total: totalProdutos,
          semEstoque,
          estoqueBaixo,
          precoMedio: `R$ ${precoMedio}`,
          porCategoria,
        },
        pedidos: {
          total: totalPedidos,
          receitaTotal: `R$ ${receitaTotal}`,
          ticketMedio: `R$ ${ticketMedio}`,
          produtoMaisVendido,
        },
        geradoEm: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
