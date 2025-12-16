import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';

export function createAuditMiddleware(db: DatabaseService) {
  return function auditMiddleware(req: Request, res: Response, next: NextFunction) {
    const started = Date.now();
    const requestId = randomUUID();

    (req as any).requestId = requestId;
    res.setHeader('x-request-id', requestId);

    res.on('finish', async () => {
      const durationMs = Date.now() - started;
      const accountId = (req as any)?.session?.accountId ?? null;

      const ipRaw = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? null;
      const ip = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw;

      const userAgent = req.headers['user-agent'] ?? null;

      try {
        await db.query(
          `
          INSERT INTO audit_logs (
            request_id,
            actor_account_id,
            ip,
            user_agent,
            method,
            path,
            status,
            duration_ms,
            error_message
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          `,
          [
            requestId,
            accountId,
            ip,
            userAgent,
            req.method,
            req.originalUrl ?? req.url,
            res.statusCode,
            durationMs,
            null,
          ],
        );
      } catch {
        // best-effort; do not block response
      }
    });

    next();
  };
}
