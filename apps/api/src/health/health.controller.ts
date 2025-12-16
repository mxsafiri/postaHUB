import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { loadEnv } from '../config/env';
import { createClient } from 'redis';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get('live')
  live() {
    return { ok: true };
  }

  @Get('ready')
  async ready(@Headers('x-healthcheck-token') token?: string) {
    const env = loadEnv();
    if (!token || token !== env.healthcheckToken) {
      throw new UnauthorizedException('invalid_healthcheck_token');
    }

    await this.db.ping();

    const client = createClient({ url: env.redisUrl });
    await client.connect();
    try {
      await client.ping();
    } finally {
      await client.disconnect();
    }

    return { ok: true };
  }
}
