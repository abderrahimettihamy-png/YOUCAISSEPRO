import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ServerPrinterController {
    static getMyPrinters(req: AuthRequest, res: Response): Promise<void>;
    static savePrinter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static deletePrinter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static testPrinter(req: AuthRequest, res: Response): Promise<void>;
    static printTicket(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default ServerPrinterController;
//# sourceMappingURL=serverPrinterController.d.ts.map