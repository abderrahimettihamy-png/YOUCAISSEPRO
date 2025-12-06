export declare enum UserRole {
    ADMIN = "ADMIN",
    CAISSIER = "CAISSIER",
    SERVEUR = "SERVEUR",
    RECEPTION = "RECEPTION"
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
export declare enum PrinterType {
    USB = "USB",
    NETWORK = "NETWORK"
}
export declare enum PrinterDestination {
    BAR = "BAR",
    CUISINE = "CUISINE"
}
export interface PrinterConfig {
    id?: number;
    destination: PrinterDestination;
    type: PrinterType;
    name: string;
    usbPort?: string;
    networkIp?: string;
    networkPort?: number;
    isActive: boolean;
}
//# sourceMappingURL=types.d.ts.map