import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type Role = {
  id: number;
  key: string;
  name: string;
};

@Injectable()
export class RolesService {
  constructor(private readonly db: DatabaseService) {}

  async getRolesForAccount(accountId: string): Promise<Role[]> {
    const res = await this.db.query<Role>(
      `
      SELECT r.id, r.key, r.name
      FROM account_roles ar
      JOIN roles r ON r.id = ar.role_id
      WHERE ar.account_id = $1
      ORDER BY r.id ASC
      `,
      [accountId],
    );
    return res.rows;
  }

  async assignRoleByKey(accountId: string, roleKey: string): Promise<void> {
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
}
