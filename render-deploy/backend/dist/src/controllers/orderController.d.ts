import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class OrderController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static addItems(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getDailySales(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getZReport(req: AuthRequest, res: Response): Promise<void>;
    static searchByTicket(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static clearSystem(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=orderController.d.ts.map