import type { CartItem, Order, Product } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Upload de imagem
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Erro ao fazer upload');
  }
  const data = await res.json();
  return data.url as string;
}

// Produtos
export const getProducts = () => request<Product[]>('/api/products');
export const getProduct = (id: number) => request<Product>(`/api/products/${id}`);
export const createProduct = (data: Omit<Product, 'id'>) =>
  request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: number, data: Omit<Product, 'id'>) =>
  request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id: number) =>
  request<void>(`/api/products/${id}`, { method: 'DELETE' });

// Carrinho
export const getCart = (sessionId: string) =>
  request<CartItem[]>(`/api/cart/${sessionId}`);
export const addToCart = (sessionId: string, productId: number, quantity = 1) =>
  request<CartItem>(`/api/cart/${sessionId}/items`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
export const updateCartItem = (sessionId: string, productId: number, quantity: number) =>
  request<CartItem | undefined>(`/api/cart/${sessionId}/items/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
export const removeFromCart = (sessionId: string, productId: number) =>
  request<void>(`/api/cart/${sessionId}/items/${productId}`, { method: 'DELETE' });
export const clearCart = (sessionId: string) =>
  request<void>(`/api/cart/${sessionId}`, { method: 'DELETE' });

// Pedidos
export const checkout = (sessionId: string) =>
  request<Order>(`/api/orders/${sessionId}/checkout`, { method: 'POST' });
export const getOrders = (sessionId: string) =>
  request<Order[]>(`/api/orders/${sessionId}`);
export const getOrder = (id: number) =>
  request<Order>(`/api/orders/detail/${id}`);
