import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminOverviewService {
  constructor(private readonly db: DatabaseService) {}

  async getOverview(): Promise<{
    health: { db: 'ok' | 'error' };
    counts: {
      accounts: number;
      partners: number;
      apiKeysActive: number;
      apiKeysRevoked: number;
      auditLogs24h: number;
    };
  }> {
    let dbHealth: 'ok' | 'error' = 'ok';
    try {
      await this.db.ping();
    } catch {
      dbHealth = 'error';
    }

    const [accountsRes, partnersRes, keysRes, audit24Res] = await Promise.all([
      this.db.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM accounts'),
      this.db.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM partners'),
      this.db.query<{ active: string; revoked: string }>(
        `
        SELECT
          SUM(CASE WHEN revoked_at IS NULL THEN 1 ELSE 0 END)::text AS active,
          SUM(CASE WHEN revoked_at IS NOT NULL THEN 1 ELSE 0 END)::text AS revoked
        FROM partner_api_keys
        `,
      ),
      this.db.query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM audit_logs
        WHERE created_at >= now() - INTERVAL '24 hours'
        `,
      ),
    ]);

    const apiKeysActive = Number(keysRes.rows?.[0]?.active ?? 0);
    const apiKeysRevoked = Number(keysRes.rows?.[0]?.revoked ?? 0);

    return {
      health: { db: dbHealth },
      counts: {
        accounts: Number(accountsRes.rows?.[0]?.count ?? 0),
        partners: Number(partnersRes.rows?.[0]?.count ?? 0),
        apiKeysActive,
        apiKeysRevoked,
        auditLogs24h: Number(audit24Res.rows?.[0]?.count ?? 0),
      },
    };
  }
}
