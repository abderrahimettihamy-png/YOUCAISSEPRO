import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class CategoryController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=categoryController.d.ts.map