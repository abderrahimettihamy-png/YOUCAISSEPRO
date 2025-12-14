import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PrintController {
    static printOrder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getTicketsByDestination(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=printController.d.ts.map