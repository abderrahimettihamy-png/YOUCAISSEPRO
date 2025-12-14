import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
declare let pool: Pool | null;
declare let db: sqlite3.Database | null;
export declare function dbRun(sql: string, params?: any[]): Promise<any>;
export declare function dbGet<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
export declare function dbAll<T = any>(sql: string, params?: any[]): Promise<T[]>;
export declare function initDatabase(): Promise<void>;
export { db, pool };
//# sourceMappingURL=database.d.ts.map