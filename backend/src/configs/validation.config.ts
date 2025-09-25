import { plainToClass, Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  S3_ENDPOINT: string;

  @IsString()
  S3_ACCESS_KEY_ID: string;

  @IsString()
  S3_SECRET_ACCESS_KEY: string;

  @IsString()
  S3_BUCKET_NAME: string;

  @IsString()
  S3_REGION: string;

  @IsString()
  CLERK_SECRET_KEY: string;

  @IsString()
  CLERK_PUBLISHABLE_KEY: string;

  @IsString()
  CLERK_PEM_PUBLIC_KEY: string;

  @IsOptional()
  @IsString()
  CLERK_JWKS_URL?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT: number;

  @IsString()
  NODE_ENV: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}
