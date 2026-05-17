export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  price: number;
  stockQuantity: number;
}

export interface CartItem {
  id: number;
  sessionId: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  sessionId: string;
  paymentCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}
