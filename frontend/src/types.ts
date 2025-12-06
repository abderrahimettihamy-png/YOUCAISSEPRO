export const UserRole = {
  ADMIN: 'ADMIN',
  CAISSIER: 'CAISSIER',
  SERVEUR: 'SERVEUR',
  RECEPTION: 'RECEPTION'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  nom: string;
  prenom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  ticketNumber?: string;
  serveurId: number;
  createdById: number;
  createdByName?: string;
  paidBy?: number;
  paidByName?: string;
  status: 'en_attente' | 'payee' | 'annulee';
  total: number;
  clientName?: string;
  notes?: string;
  roomNumber?: string;
  sentToReception?: boolean;
  receptionPrintedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: Array<{
    id?: number;
    productId?: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    addedById?: number;
    addedByName?: string;
    addedAt?: string;
  }>;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  addedById: number;
  addedByName?: string;
  addedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  type?: 'repas' | 'boissons';
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailySales {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: UserRole;
    nom: string;
    prenom: string;
  };
}
