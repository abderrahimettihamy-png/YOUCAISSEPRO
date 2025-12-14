interface PrinterConfig {
    id: number;
    destination: 'BAR' | 'CUISINE';
    type: 'USB' | 'NETWORK';
    name: string;
    usbPort?: string;
    networkIp?: string;
    networkPort?: number;
    isActive: boolean;
}
export declare class ThermalPrintService {
    /**
     * Imprime un ticket sur une imprimante thermique
     */
    static printTicket(printerConfig: PrinterConfig, ticketData: {
        ticketNumber: string;
        clientName: string;
        mealTime?: string;
        notes?: string;
        items: Array<{
            quantity: number;
            productName: string;
            price: number;
            total: number;
        }>;
        serveur: string;
        destination: string;
        createdAt: string;
    }): Promise<boolean>;
    /**
     * Test d'impression simple
     */
    static testPrint(printerConfig: PrinterConfig): Promise<boolean>;
}
export {};
//# sourceMappingURL=thermalPrintService.d.ts.map