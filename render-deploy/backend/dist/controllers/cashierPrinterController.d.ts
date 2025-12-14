import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class CashierPrinterController {
    static getMyPrinters(req: AuthRequest, res: Response): Promise<void>;
    static savePrinter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static deletePrinter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static testPrinter(req: AuthRequest, res: Response): Promise<void>;
    static printTicket(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getCustomization(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static saveCustomization(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=cashierPrinterController.d.ts.map