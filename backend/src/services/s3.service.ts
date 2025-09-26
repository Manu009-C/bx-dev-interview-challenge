import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const s3Config = this.configService.get<{
      bucketName: string;
      accessKeyId: string;
      secretAccessKey: string;
      endpoint: string;
      region?: string;
    }>('s3');

    if (!s3Config) {
      throw new Error('S3 configuration not found');
    }

    // Validate required S3 configuration
    if (!s3Config.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
    if (!s3Config.accessKeyId) {
      throw new Error('S3_ACCESS_KEY_ID environment variable is required');
    }
    if (!s3Config.secretAccessKey) {
      throw new Error('S3_SECRET_ACCESS_KEY environment variable is required');
    }
    if (!s3Config.endpoint) {
      throw new Error('S3_ENDPOINT environment variable is required');
    }

    this.s3Client = new S3Client({
      region: s3Config.region || 'us-east-1',
      endpoint: s3Config.endpoint,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.bucketName = s3Config.bucketName;
  }

  async checkBucketExists(): Promise<boolean> {
    try {
      const listBucketsResponse = await this.s3Client.send(
        new ListBucketsCommand({}),
      );
      const bucketExists = listBucketsResponse.Buckets?.some(
        (bucket) => bucket.Name === this.bucketName,
      );
      return bucketExists || false;
    } catch {
      // TODO: Handle/Log error
      return false;
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    const key = `users/${userId}/${uuidv4()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.originalname,
            userId: userId,
          },
        }),
      );

      return key;
    } catch (error) {
      if (error instanceof Error && error.message.includes('NoSuchBucket')) {
        throw new Error(
          `S3 bucket '${this.bucketName}' does not exist. Please create it manually via MinIO Console at http://localhost:9001`,
        );
      }
      throw error;
    }
  }

  async generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
  }

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch {
      // TODO: Handle/Log error
      return false;
    }
  }
}
