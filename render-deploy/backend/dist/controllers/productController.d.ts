import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ProductController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getByCategoryGrouped(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=productController.d.ts.map