import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class UserController {
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getStats(req: AuthRequest, res: Response): Promise<void>;
    static resetPassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static logout(req: AuthRequest, res: Response): Promise<void>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=userController.d.ts.map