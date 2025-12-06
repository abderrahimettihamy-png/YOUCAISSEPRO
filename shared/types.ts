export enum UserRole {
  ADMIN = 'ADMIN',
  CAISSIER = 'CAISSIER',
  SERVEUR = 'SERVEUR',
  RECEPTION = 'RECEPTION'
}

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
  serveurId: number;
  createdById: number;
  createdByName?: string;
  paidBy?: number;
  paidByName?: string;
  status: 'EN_COURS' | 'PAYEE' | 'ANNULEE';
  total: number;
  roomNumber?: string;
  sentToReception?: boolean;
  receptionPrintedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  addedById: number;
  addedByName?: string;
  addedAt: string;
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

export enum PrinterType {
  USB = 'USB',
  NETWORK = 'NETWORK'
}

export enum PrinterDestination {
  BAR = 'BAR',
  CUISINE = 'CUISINE'
}

export interface PrinterConfig {
  id?: number;
  destination: PrinterDestination;
  type: PrinterType;
  name: string;
  usbPort?: string; // Ex: COM1, COM2, /dev/usb/lp0
  networkIp?: string; // Ex: 192.168.1.100
  networkPort?: number; // Ex: 9100
  isActive: boolean;
}
