import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { DatabaseService } from '../database/database.service';
import { normalizePhoneToE164 } from '../common/phone/normalize-phone';

export type Account = {
  id: string;
  phone_e164: string;
  display_name: string | null;
  nida_number?: string | null;
  nida_verification_status?: 'not_provided' | 'pending' | 'verified' | 'failed' | string;
  nida_verification_updated_at?: string | null;
  nida_verified_at?: string | null;
  nida_verification_failure_reason?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class AccountsService {
  constructor(private readonly db: DatabaseService) {}

  async createAccount(params: {
    phone: string;
    password: string;
    displayName?: string;
    nidaNumber?: string;
  }): Promise<Account> {
    let phoneE164: string;
    try {
      phoneE164 = normalizePhoneToE164(params.phone);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'invalid phone number';
      throw new BadRequestException(message);
    }
    const passwordHash = await argon2.hash(params.password);
    const nidaVerificationStatus = params.nidaNumber ? 'pending' : 'not_provided';

    return this.db.withTransaction(async (q) => {
      const existing = await q('SELECT id FROM accounts WHERE phone_e164 = $1', [phoneE164]);
      if (existing.rowCount && existing.rowCount > 0) {
        throw new ConflictException('phone already registered');
      }

      let created;
      try {
        created = await q(
          `
          INSERT INTO accounts (
            phone_e164,
            display_name,
            nida_number,
            nida_verification_status,
            nida_verification_updated_at
          )
          VALUES ($1, $2, $3, $4, CASE WHEN $3 IS NULL THEN NULL ELSE now() END)
          RETURNING *
          `,
          [phoneE164, params.displayName ?? null, params.nidaNumber ?? null, nidaVerificationStatus],
        );
      } catch (e) {
        const err = e as any;
        if (err?.code === '23505') {
          const constraint = String(err?.constraint ?? '');
          if (constraint === 'accounts_nida_number_unique_idx') {
            throw new ConflictException('nida number already registered');
          }
          throw new ConflictException('account already exists');
        }
        throw e;
      }

      const account = created.rows[0] as Account;
      await q('INSERT INTO auth_credentials (account_id, password_hash) VALUES ($1, $2)', [account.id, passwordHash]);

      return account;
    });
  }

  async verifyPassword(params: { phone: string; password: string }): Promise<Account | null> {
    let phoneE164: string;
    try {
      phoneE164 = normalizePhoneToE164(params.phone);
    } catch {
      return null;
    }

    const res = await this.db.query<{
      id: string;
      phone_e164: string;
      display_name: string | null;
      nida_number: string | null;
      nida_verification_status: string;
      nida_verification_updated_at: string | null;
      nida_verified_at: string | null;
      nida_verification_failure_reason: string | null;
      status: string;
      created_at: string;
      updated_at: string;
      password_hash: string;
    }>(
      `
      SELECT a.*, c.password_hash
      FROM accounts a
      JOIN auth_credentials c ON c.account_id = a.id
      WHERE a.phone_e164 = $1
      `,
      [phoneE164],
    );

    if (!res.rowCount) return null;

    const row = res.rows[0];
    const ok = await argon2.verify(row.password_hash, params.password);
    if (!ok) return null;

    const { password_hash, ...account } = row;
    return account;
  }

  async getAccountById(id: string): Promise<Account | null> {
    const res = await this.db.query<Account>('SELECT * FROM accounts WHERE id = $1', [id]);
    return res.rowCount ? res.rows[0] : null;
  }
}
