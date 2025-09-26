import { Mocked, TestBed } from '@suites/unit';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';
import { FileValidationService } from '../services/file-validation.service';
import {
  FileUploadResponseDto,
  FileDownloadResponseDto,
  FileDto,
} from '../dtos/file.dto';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';

describe('FilesController', () => {
  let filesController: FilesController;
  let filesService: Mocked<FilesService>;
  let fileValidationService: Mocked<FileValidationService>;

  const mockUser: ClerkUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://example.com/avatar.jpg',
  };

  const mockMulterFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test content'),
  } as Express.Multer.File;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(FilesController).compile();

    filesController = unit;
    filesService = unitRef.get(FilesService);
    fileValidationService = unitRef.get(FileValidationService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const expectedResponse = new FileUploadResponseDto({
        file: {} as FileDto,
        message: 'File uploaded successfully',
      });

      // Mock rate limit check to return success
      fileValidationService.checkRateLimit.mockResolvedValue({
        isAllowed: true,
        remainingUploads: 19,
        resetTime: new Date(),
      });

      // Mock file validation
      fileValidationService.validateFile.mockResolvedValue({
        isValid: true,
        detectedMimeType: 'application/pdf',
        fileHash: 'test-hash',
        sanitizedFileName: 'test.pdf',
      });

      filesService.uploadFile.mockResolvedValue(expectedResponse);

      const result = await filesController.uploadFile(mockMulterFile, mockUser);

      expect(fileValidationService.checkRateLimit).toHaveBeenCalledWith(
        mockUser.id,
        mockMulterFile.size,
      );
      expect(fileValidationService.validateFile).toHaveBeenCalledWith(
        mockMulterFile,
        mockUser.id,
      );
      expect(filesService.uploadFile).toHaveBeenCalledWith(
        mockMulterFile,
        mockUser.id,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException when no file uploaded', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        filesController.uploadFile(null as any, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(filesService.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is undefined', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        filesController.uploadFile(undefined as any, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(filesService.uploadFile).not.toHaveBeenCalled();
    });
  });

  describe('getUserFiles', () => {
    it('should return user files', async () => {
      const expectedFiles = [{ id: 'file-1' }, { id: 'file-2' }];

      filesService.getUserFiles.mockResolvedValue(expectedFiles as FileDto[]);

      const result = await filesController.getUserFiles(mockUser);

      expect(filesService.getUserFiles).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedFiles);
    });
  });

  describe('downloadFile', () => {
    it('should generate download URL', async () => {
      const validFileId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = new FileDownloadResponseDto({
        downloadUrl: 'https://s3.example.com/download-url',
        expiresIn: 3600,
      });

      filesService.generateDownloadUrl.mockResolvedValue(expectedResponse);

      const result = await filesController.downloadFile(validFileId, mockUser);

      expect(filesService.generateDownloadUrl).toHaveBeenCalledWith(
        validFileId,
        mockUser.id,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getFileMetadata', () => {
    it('should return file metadata', async () => {
      const validFileId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedMetadata = { id: validFileId, name: 'test.pdf' };

      filesService.getFileMetadata.mockResolvedValue(
        expectedMetadata as unknown as FileDto,
      );

      const result = await filesController.getFileMetadata(
        validFileId,
        mockUser,
      );

      expect(filesService.getFileMetadata).toHaveBeenCalledWith(
        validFileId,
        mockUser.id,
      );
      expect(result).toEqual(expectedMetadata);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const validFileId = '123e4567-e89b-12d3-a456-426614174000';
      filesService.deleteFile.mockResolvedValue(undefined);

      const result = await filesController.deleteFile(validFileId, mockUser);

      expect(filesService.deleteFile).toHaveBeenCalledWith(
        validFileId,
        mockUser.id,
      );
      expect(result).toEqual({ message: 'File deleted successfully' });
    });
  });
});
