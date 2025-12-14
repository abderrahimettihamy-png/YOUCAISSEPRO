import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../shared/types';
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: UserRole;
    };
}
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function authorize(...roles: UserRole[]): (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map