import { TestBed } from '@suites/unit';
import { S3Service } from './s3.service';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('S3Service', () => {
  let s3Service: S3Service;

  const mockMulterFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test content'),
  } as Express.Multer.File;

  beforeAll(async () => {
    const { unit } = await TestBed.solitary(S3Service).compile();
    s3Service = unit;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should return expected key format', async () => {
      const result = await s3Service.uploadFile(mockMulterFile, 'user-123');

      expect(result).toBe('users/user-123/mock-uuid-123-test.pdf');
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
});
