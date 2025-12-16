import { Pool } from 'pg';
import argon2 from 'argon2';
import { normalizePhoneToE164 } from '../src/common/phone/normalize-phone';

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('node:path') as typeof import('node:path');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: path.resolve(process.cwd(), '../../.env') });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} catch {
  // optional
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const map = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    map.set(key, value);
    i++;
  }

  return {
    phone: map.get('phone'),
    password: map.get('password'),
    displayName: map.get('displayName') ?? 'Platform Admin',
  };
}

async function main() {
  const { phone, password, displayName } = parseArgs();
  if (!phone || !password) {
    throw new Error('Usage: npm -w apps/api run bootstrap:platform-admin -- --phone <+255...|07...> --password <...> [--displayName "..."]');
  }

  const databaseUrl = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl });

  const phoneE164 = normalizePhoneToE164(phone);
  const passwordHash = await argon2.hash(password);

  await pool.query('BEGIN');
  try {
    const existing = await pool.query<{ id: string }>('SELECT id FROM accounts WHERE phone_e164 = $1', [phoneE164]);

    let accountId: string;
    if (existing.rowCount) {
      accountId = existing.rows[0].id;
      await pool.query('UPDATE accounts SET display_name = COALESCE($2, display_name), updated_at = now() WHERE id = $1', [
        accountId,
        displayName,
      ]);
      await pool.query(
        'INSERT INTO auth_credentials (account_id, password_hash) VALUES ($1, $2) ON CONFLICT (account_id) DO UPDATE SET password_hash = EXCLUDED.password_hash',
        [accountId, passwordHash],
      );
    } else {
      const created = await pool.query<{ id: string }>(
        'INSERT INTO accounts (phone_e164, display_name) VALUES ($1, $2) RETURNING id',
        [phoneE164, displayName],
      );
      accountId = created.rows[0].id;
      await pool.query('INSERT INTO auth_credentials (account_id, password_hash) VALUES ($1, $2)', [accountId, passwordHash]);
    }

    const roleRes = await pool.query<{ id: number }>('SELECT id FROM roles WHERE key = $1', ['platform_admin']);
    if (!roleRes.rowCount) {
      throw new Error('platform_admin role not found. Did you run migrations?');
    }

    await pool.query(
      'INSERT INTO account_roles (account_id, role_id) VALUES ($1, $2) ON CONFLICT (account_id, role_id) DO NOTHING',
      [accountId, roleRes.rows[0].id],
    );

    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
