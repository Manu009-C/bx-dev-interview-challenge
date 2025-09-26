import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/auth.guard';
import { AuthExceptionFilter } from './filters/auth-exception.filter';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const logger = new ConsoleLogger({
    prefix: 'Bonusx',
  });
  const app = await NestFactory.create(AppModule, {
    abortOnError: true,
    logger,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  // Set up global authentication guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Set up global exception filter for auth errors
  app.useGlobalFilters(new AuthExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') as number;

  await app.listen(port, () => {
    logger.log(
      `🚀 Bonusx File Uploader is running on: http://localhost:${port}`,
    );
  });
}

void bootstrap();
