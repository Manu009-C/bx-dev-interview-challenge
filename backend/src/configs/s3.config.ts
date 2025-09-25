export const s3Config = {
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  bucketName: process.env.S3_BUCKET_NAME,
  forcePathStyle: true, // For MinIO compatibility
};
