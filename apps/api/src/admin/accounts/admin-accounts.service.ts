import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type AdminAccount = {
  id: string;
  phone_e164: string;
  display_name: string | null;
  nida_number: string | null;
  nida_verification_status: string;
  status: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class AdminAccountsService {
  constructor(private readonly db: DatabaseService) {}

  async searchAccounts(params: { query?: string; limit?: number }): Promise<AdminAccount[]> {
    const q = (params.query ?? '').trim();
    const limit = Math.max(1, Math.min(params.limit ?? 25, 100));

    if (!q) {
      const res = await this.db.query<AdminAccount>(
        `
        SELECT
          id,
          phone_e164,
          display_name,
          nida_number,
          COALESCE(nida_verification_status, 'not_provided') as nida_verification_status,
          status,
          created_at,
          updated_at
        FROM accounts
        ORDER BY created_at DESC
        LIMIT $1
        `,
        [limit],
      );
      return res.rows;
    }

    const like = `%${q}%`;
    const res = await this.db.query<AdminAccount>(
      `
      SELECT
        id,
        phone_e164,
        display_name,
        nida_number,
        COALESCE(nida_verification_status, 'not_provided') as nida_verification_status,
        status,
        created_at,
        updated_at
      FROM accounts
      WHERE id::text ILIKE $1
         OR phone_e164 ILIKE $1
         OR COALESCE(display_name, '') ILIKE $1
         OR COALESCE(nida_number, '') ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [like, limit],
    );

    return res.rows;
  }

  async getAccount(accountId: string): Promise<AdminAccount | null> {
    const res = await this.db.query<AdminAccount>(
      `
      SELECT
        id,
        phone_e164,
        display_name,
        nida_number,
        COALESCE(nida_verification_status, 'not_provided') as nida_verification_status,
        status,
        created_at,
        updated_at
      FROM accounts
      WHERE id = $1
      `,
      [accountId],
    );
    return res.rowCount ? res.rows[0] : null;
  }

  async getRoles(accountId: string): Promise<string[]> {
    const res = await this.db.query<{ key: string }>(
      `
      SELECT r.key
      FROM account_roles ar
      JOIN roles r ON r.id = ar.role_id
      WHERE ar.account_id = $1
      ORDER BY r.id ASC
      `,
      [accountId],
    );
    return res.rows.map((r) => r.key);
  }

  async addRole(accountId: string, roleKey: string): Promise<void> {
    await this.db.withTransaction(async (q) => {
      const roleRes = await q('SELECT id FROM roles WHERE key = $1', [roleKey]);
      if (!roleRes.rowCount) {
        throw new Error(`unknown role: ${roleKey}`);
      }

      await q(
        'INSERT INTO account_roles (account_id, role_id) VALUES ($1, $2) ON CONFLICT (account_id, role_id) DO NOTHING',
        [accountId, (roleRes.rows[0] as { id: number }).id],
      );
    });
  }

  async removeRole(accountId: string, roleKey: string): Promise<void> {
    await this.db.query(
      `
      DELETE FROM account_roles ar
      USING roles r
      WHERE ar.role_id = r.id
        AND ar.account_id = $1
        AND r.key = $2
      `,
      [accountId, roleKey],
    );
  }
}
