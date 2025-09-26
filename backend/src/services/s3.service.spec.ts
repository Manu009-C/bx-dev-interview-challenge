import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('S3Service', () => {
  let mockConfigService: Partial<ConfigService>;

  const mockMulterFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test content'),
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor validation', () => {
    it('should throw error when S3 configuration is not found', () => {
      const mockConfigServiceNoConfig = {
        get: jest.fn().mockReturnValue(null),
      };

      expect(
        () =>
          new S3Service(mockConfigServiceNoConfig as unknown as ConfigService),
      ).toThrow('S3 configuration not found');
    });

    it('should throw error when bucketName is missing', () => {
      const mockConfigServiceNoBucket = {
        get: jest.fn().mockReturnValue({
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
          endpoint: 'http://localhost:9000',
        }),
      };

      expect(
        () =>
          new S3Service(mockConfigServiceNoBucket as unknown as ConfigService),
      ).toThrow('S3_BUCKET_NAME environment variable is required');
    });

    it('should throw error when accessKeyId is missing', () => {
      const mockConfigServiceNoAccessKey = {
        get: jest.fn().mockReturnValue({
          bucketName: 'test-bucket',
          secretAccessKey: 'test-secret-key',
          endpoint: 'http://localhost:9000',
        }),
      };

      expect(
        () =>
          new S3Service(
            mockConfigServiceNoAccessKey as unknown as ConfigService,
          ),
      ).toThrow('S3_ACCESS_KEY_ID environment variable is required');
    });

    it('should throw error when secretAccessKey is missing', () => {
      const mockConfigServiceNoSecretKey = {
        get: jest.fn().mockReturnValue({
          bucketName: 'test-bucket',
          accessKeyId: 'test-access-key',
          endpoint: 'http://localhost:9000',
        }),
      };

      expect(
        () =>
          new S3Service(
            mockConfigServiceNoSecretKey as unknown as ConfigService,
          ),
      ).toThrow('S3_SECRET_ACCESS_KEY environment variable is required');
    });

    it('should throw error when endpoint is missing', () => {
      const mockConfigServiceNoEndpoint = {
        get: jest.fn().mockReturnValue({
          bucketName: 'test-bucket',
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        }),
      };

      expect(
        () =>
          new S3Service(
            mockConfigServiceNoEndpoint as unknown as ConfigService,
          ),
      ).toThrow('S3_ENDPOINT environment variable is required');
    });
  });

  describe('working methods', () => {
    let s3Service: S3Service;

    beforeAll(() => {
      // Mock ConfigService
      mockConfigService = {
        get: jest.fn().mockReturnValue({
          bucketName: 'test-bucket',
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
          endpoint: 'http://localhost:9000',
          region: 'us-east-1',
        }),
      };

      // Create S3Service instance directly with mocked ConfigService
      s3Service = new S3Service(mockConfigService as unknown as ConfigService);
    });

    describe('uploadFile', () => {
      it('should return expected key format pattern', async () => {
        const result = await s3Service.uploadFile(mockMulterFile, 'user-123');

        // Test the pattern instead of exact UUID value
        expect(result).toMatch(/^users\/user-123\/.+-test\.pdf$/);
        expect(result).toContain('users/user-123/');
        expect(result).toContain('-test.pdf');
      });
    });

    describe('generateDownloadUrl', () => {
      it('should not throw error', async () => {
        await expect(
          s3Service.generateDownloadUrl('test-key'),
        ).resolves.not.toThrow();
      });
    });

    describe('generateUploadUrl', () => {
      it('should not throw error', async () => {
        await expect(
          s3Service.generateUploadUrl('test-key', 'application/pdf'),
        ).resolves.not.toThrow();
      });
    });

    describe('deleteFile', () => {
      it('should complete without error', async () => {
        await expect(s3Service.deleteFile('test-key')).resolves.not.toThrow();
      });
    });

    describe('fileExists', () => {
      it('should return a boolean', async () => {
        const result = await s3Service.fileExists('test-key');

        expect(typeof result).toBe('boolean');
      });
    });

    describe('checkBucketExists', () => {
      it('should return a boolean', async () => {
        const result = await s3Service.checkBucketExists();

        expect(typeof result).toBe('boolean');
      });
    });
  });
});
