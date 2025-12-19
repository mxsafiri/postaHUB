import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { DatabaseService } from '../../database/database.service';

export type Partner = {
  id: string;
  name: string;
  status: 'active' | 'suspended' | string;
  created_at: string;
  updated_at: string;
};

export type PartnerApiKey = {
  id: string;
  partner_id: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function generateApiKey(): string {
  // 32 random bytes -> base64url gives a short, URL-safe token.
  return crypto.randomBytes(32).toString('base64url');
}

@Injectable()
export class AdminPartnersService {
  constructor(private readonly db: DatabaseService) {}

  async createPartner(params: { name: string }): Promise<Partner> {
    const res = await this.db.query<Partner>(
      `
      INSERT INTO partners (name)
      VALUES ($1)
      RETURNING *
      `,
      [params.name.trim()],
    );
    return res.rows[0];
  }

  async listPartners(): Promise<Partner[]> {
    const res = await this.db.query<Partner>('SELECT * FROM partners ORDER BY created_at DESC');
    return res.rows;
  }

  async listPartnerKeys(partnerId: string): Promise<PartnerApiKey[]> {
    const res = await this.db.query<PartnerApiKey>(
      `
      SELECT id, partner_id, prefix, created_at, last_used_at, revoked_at
      FROM partner_api_keys
      WHERE partner_id = $1
      ORDER BY created_at DESC
      `,
      [partnerId],
    );
    return res.rows;
  }

  async createPartnerKey(partnerId: string): Promise<{ apiKey: string; key: PartnerApiKey }> {
    const apiKey = `ph_${generateApiKey()}`;
    const prefix = apiKey.slice(0, 10);
    const keyHash = sha256Hex(apiKey);

    const res = await this.db.query<PartnerApiKey>(
      `
      INSERT INTO partner_api_keys (partner_id, prefix, key_hash)
      VALUES ($1, $2, $3)
      RETURNING id, partner_id, prefix, created_at, last_used_at, revoked_at
      `,
      [partnerId, prefix, keyHash],
    );

    return { apiKey, key: res.rows[0] };
  }

  async revokeKey(keyId: string): Promise<{ ok: true }> {
    await this.db.query(
      `
      UPDATE partner_api_keys
      SET revoked_at = now()
      WHERE id = $1
      `,
      [keyId],
    );
    return { ok: true };
  }
}
