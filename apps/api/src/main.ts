import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import helmet from 'helmet';
import { loadEnv } from './config/env';
import { DatabaseService } from './database/database.service';
import { createAuditMiddleware } from './audit/audit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = loadEnv();

  app.enableCors({
    origin: env.corsOrigins,
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const redisClient = createClient({ url: env.redisUrl });
  await redisClient.connect();

  const store = new RedisStore({
    client: redisClient,
    prefix: 'posta:sess:',
  });

  app.use(
    session({
      name: env.sessionCookieName,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.nodeEnv === 'production',
      },
    }),
  );

  const db = app.get(DatabaseService);
  app.use(createAuditMiddleware(db));

  await app.listen(env.port);
}
bootstrap();
