import { validate } from './validation.config';

function getCommonConfig() {
  const config = {
    port: parseInt(process.env.PORT ?? '3000', 10),
    database: {
      url: process.env.DATABASE_URL,
    },
    s3: {
      endpoint: process.env.S3_ENDPOINT,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
    },
    clerk: {
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      pemPublicKey: process.env.CLERK_PEM_PUBLIC_KEY,
      jwksUrl: process.env.CLERK_JWKS_URL,
    },
    frontendUrl: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV,
  };

  // Validate configuration in production
  if (process.env.NODE_ENV === 'production') {
    validate(process.env);
  }

  return config;
}

export default getCommonConfig;
