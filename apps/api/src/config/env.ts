export type AppEnv = {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  databaseUrl: string;
  redisUrl: string;
  sessionSecret: string;
  sessionCookieName: string;
  healthcheckToken: string;
};

function loadDotenvIfPresent() {
  if (process.env.DOTENV_LOADED === '1') return;
  process.env.DOTENV_LOADED = '1';

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = require('dotenv') as { config: (opts: { path: string }) => void };
    // Most commands run from repo root.
    dotenv.config({ path: '.env' });
    // But allow execution from apps/api as well.
    dotenv.config({ path: '../../.env' });
  } catch {
    // dotenv is optional in production images and should not crash the app
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function loadEnv(): AppEnv {
  loadDotenvIfPresent();
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3002);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('Invalid API_PORT/PORT');
  }

  const corsOriginsRaw = process.env.CORS_ORIGINS ?? 'http://localhost:3000';
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    port,
    corsOrigins,
    databaseUrl: requireEnv('DATABASE_URL'),
    redisUrl: requireEnv('REDIS_URL'),
    sessionSecret: requireEnv('SESSION_SECRET'),
    sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'posta_session',
    healthcheckToken: requireEnv('HEALTHCHECK_TOKEN'),
  };
}
