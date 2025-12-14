import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ServerPrinterController {
    static getMyPrinters(req: AuthRequest, res: Response): Promise<void>;
    static savePrinter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deletePrinter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static testPrinter(req: AuthRequest, res: Response): Promise<void>;
    static printTicket(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export default ServerPrinterController;
//# sourceMappingURL=serverPrinterController.d.ts.map