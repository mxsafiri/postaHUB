import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryConfig, QueryResult } from 'pg';
import { loadEnv } from '../config/env';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const env = loadEnv();
    this.pool = new Pool({ connectionString: env.databaseUrl });
  }

  async query<T = any>(text: string | QueryConfig<any[]>, params?: any[]): Promise<QueryResult<T>> {
    if (typeof text === 'string') {
      return this.pool.query<T>(text, params);
    }
    return this.pool.query<T>(text);
  }

  async withTransaction<T>(fn: (q: (sql: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn((sql, params) => client.query(sql, params));
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async ping(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
