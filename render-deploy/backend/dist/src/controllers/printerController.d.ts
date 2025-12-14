import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PrinterController {
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getByDestination(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static testPrint(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=printerController.d.ts.map