import { Mocked, TestBed } from '@suites/unit';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';
import {
  FileUploadResponseDto,
  FileDownloadResponseDto,
  FileDto,
} from '../dtos/file.dto';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';

describe('FilesController', () => {
  let filesController: FilesController;
  let filesService: Mocked<FilesService>;

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

      filesService.uploadFile.mockResolvedValue(expectedResponse);

      const result = await filesController.uploadFile(mockMulterFile, mockUser);

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
      const expectedResponse = new FileDownloadResponseDto({
        downloadUrl: 'https://s3.example.com/download-url',
        expiresIn: 3600,
      });

      filesService.generateDownloadUrl.mockResolvedValue(expectedResponse);

      const result = await filesController.downloadFile('file-123', mockUser);

      expect(filesService.generateDownloadUrl).toHaveBeenCalledWith(
        'file-123',
        mockUser.id,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getFileMetadata', () => {
    it('should return file metadata', async () => {
      const expectedMetadata = { id: 'file-123', name: 'test.pdf' };

      filesService.getFileMetadata.mockResolvedValue(
        expectedMetadata as unknown as FileDto,
      );

      const result = await filesController.getFileMetadata(
        'file-123',
        mockUser,
      );

      expect(filesService.getFileMetadata).toHaveBeenCalledWith(
        'file-123',
        mockUser.id,
      );
      expect(result).toEqual(expectedMetadata);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      filesService.deleteFile.mockResolvedValue(undefined);

      const result = await filesController.deleteFile('file-123', mockUser);

      expect(filesService.deleteFile).toHaveBeenCalledWith(
        'file-123',
        mockUser.id,
      );
      expect(result).toEqual({ message: 'File deleted successfully' });
    });
  });
});
