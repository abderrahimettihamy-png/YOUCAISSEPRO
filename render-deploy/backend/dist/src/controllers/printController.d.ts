import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PrintController {
    static printOrder(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getTicketsByDestination(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=printController.d.ts.map