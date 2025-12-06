import axios from 'axios';
import type { LoginRequest, LoginResponse, User, Order, DailySales, Category, Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token invalide ou expiré - déconnecter l'utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Erreur logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: (): LoginResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get('/users/stats/dashboard');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User>): Promise<{ userId: number }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<void> => {
    await api.put(`/users/${id}`, data);
  },

  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    await api.put(`/users/${id}/reset-password`, { newPassword });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const orderService = {
  create: async (data: { items: Array<{ productId?: number; productName: string; quantity: number; price: number }>; clientName?: string; notes?: string }): Promise<{ orderId: number; total: number; ticketNumber: string }> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  addItems: async (orderId: number, items: Array<{ productId?: number; productName: string; quantity: number; price: number }>): Promise<{ orderId: number; additionalTotal: number; newTotal: number }> => {
    const response = await api.post(`/orders/${orderId}/items`, { items });
    return response.data;
  },

  getAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  update: async (id: number, data: { items?: any[]; status?: string; paymentMethod?: string; discount?: number; discountType?: string; paidAmount?: number; clientName?: string; notes?: string }): Promise<void> => {
    await api.put(`/orders/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  getDailySales: async (date?: string): Promise<DailySales> => {
    const response = await api.get<DailySales>('/orders/stats/daily-sales', {
      params: { date },
    });
    return response.data;
  },

  getZReport: async (date?: string): Promise<any> => {
    const response = await api.get('/orders/stats/z-report', { params: { date } });
    return response.data;
  },

  searchByTicket: async (ticketNumber: string): Promise<Order & { items: any[] }> => {
    const response = await api.get('/orders/search/ticket', { params: { ticketNumber } });
    return response.data;
  },

  clearSystem: async (): Promise<{ message: string; note: string }> => {
    const response = await api.delete('/orders/system/clear');
    return response.data;
  },
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; type?: 'repas' | 'boissons' }): Promise<{ categoryId: number }> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<void> => {
    await api.put(`/categories/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export const productService = {
  getAll: async (params?: { categoryId?: number; available?: boolean }): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  getGrouped: async (): Promise<Array<Category & { products: Product[] }>> => {
    const response = await api.get('/products/grouped');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>): Promise<{ productId: number }> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>): Promise<void> => {
    await api.put(`/products/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const printerService = {
  getAll: async () => {
    const response = await api.get('/printers');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/printers/${id}`);
    return response.data;
  },

  getByDestination: async (destination: 'BAR' | 'CUISINE') => {
    const response = await api.get(`/printers/destination/${destination}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/printers', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/printers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/printers/${id}`);
  },
};

export const printService = {
  // Imprimer une commande (envoi automatique BAR/CUISINE)
  printOrder: async (orderId: number) => {
    const response = await api.post('/print/order', { orderId });
    return response.data;
  },

  // Récupérer les tickets séparés pour aperçu
  getTicketsByDestination: async (orderId: number) => {
    const response = await api.get(`/print/order/${orderId}/tickets`);
    return response.data;
  },
};

export default api;
