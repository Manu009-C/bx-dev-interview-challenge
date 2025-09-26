import { Mocked, TestBed } from '@suites/unit';
import { NotFoundException } from '@nestjs/common';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { S3Service } from './s3.service';
import { UserService } from './user.service';
import { File, FileExtensionType } from '../entities/file.entity';
import { User } from '../entities/user.entity';
import { Mapper } from '../utils/mapper/mapper';
import {
  FileDto,
  FileUploadResponseDto,
  FileDownloadResponseDto,
} from '../dtos/file.dto';

jest.mock('../utils/mapper/mapper', () => ({
  Mapper: {
    mapData: jest.fn(),
    mapArrayData: jest.fn(),
  },
}));

describe('FilesService', () => {
  let filesService: FilesService;
  let fileRepository: Mocked<Repository<File>>;
  let s3Service: Mocked<S3Service>;
  let userService: Mocked<UserService>;
  let configService: Mocked<ConfigService>;
  let dataSource: Mocked<DataSource>;
  let queryRunner: Mocked<QueryRunner>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://example.com/avatar.jpg',
  } as User;

  const mockFile = {
    id: 'file-123',
    name: 'test.pdf',
    s3Key: 'users/user-123/uuid-test.pdf',
    s3Bucket: 'test-bucket',
    extensionType: 'PDF',
    size: 1024,
    userId: 'user-123',
  } as File;

  const mockMulterFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test content'),
  } as Express.Multer.File;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(FilesService).compile();

    filesService = unit;
    fileRepository = unitRef.get('FileRepository');
    s3Service = unitRef.get(S3Service);
    userService = unitRef.get(UserService);
    configService = unitRef.get(ConfigService);
    dataSource = unitRef.get(DataSource);

    // Mock DataSource and QueryRunner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as Mocked<QueryRunner>;

    dataSource.createQueryRunner.mockReturnValue(
      queryRunner as unknown as QueryRunner,
    );
    configService.get.mockReturnValue({ bucketName: 'bonusx-bucket' });

    jest.spyOn(Mapper, 'mapData').mockImplementation();
    jest.spyOn(Mapper, 'mapArrayData').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DataSource mock
    dataSource.createQueryRunner.mockReturnValue(
      queryRunner as unknown as QueryRunner,
    );
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const s3Key = 'users/user-123/uuid-test.pdf';
      const fileDto = new FileDto({
        id: 'file-123',
        name: 'test.pdf',
        extensionType: FileExtensionType.PDF,
        size: 1024,
        s3Bucket: 'test-bucket',
        s3Key: 'users/user-123/uuid-test.pdf',
        userId: 'user-123',
        uploadedAt: new Date(),
      });
      const expectedResponse = new FileUploadResponseDto({
        file: fileDto,
        message: 'File uploaded successfully',
      });

      // Setup mocks
      userService.findUserById.mockResolvedValue(mockUser);
      fileRepository.findOne.mockResolvedValue(null); // No concurrent upload
      s3Service.uploadFile.mockResolvedValue(s3Key);
      queryRunner.manager.save.mockResolvedValue(mockFile);
      jest.spyOn(Mapper, 'mapData').mockReturnValue(fileDto);

      const result = await filesService.uploadFile(mockMulterFile, 'user-123');

      expect(userService.findUserById).toHaveBeenCalledWith('user-123');
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        mockMulterFile,
        'user-123',
        expect.stringMatching(/^users\/user-123\/\d+-test\.pdf$/),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Mapper.mapData as jest.Mock).toHaveBeenCalledWith(FileDto, {
        ...mockFile,
        status: 'COMPLETED',
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when user not found', async () => {
      userService.findUserById.mockResolvedValue(null);

      await expect(
        filesService.uploadFile(mockMulterFile, 'user-123'),
      ).rejects.toThrow(NotFoundException);
      expect(userService.findUserById).toHaveBeenCalledWith('user-123');
      expect(s3Service.uploadFile).not.toHaveBeenCalled();
      expect(fileRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserFiles', () => {
    it('should return user files', async () => {
      const files = [mockFile];
      const fileDtos = [
        new FileDto({
          id: 'file-123',
          name: 'test.pdf',
          extensionType: FileExtensionType.PDF,
          size: 1024,
          s3Bucket: 'test-bucket',
          s3Key: 'users/user-123/uuid-test.pdf',
          userId: 'user-123',
          uploadedAt: new Date(),
        }),
      ];

      fileRepository.find.mockResolvedValue(files);
      jest.spyOn(Mapper, 'mapArrayData').mockReturnValue(fileDtos);

      const result = await filesService.getUserFiles('user-123');

      expect(fileRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { uploadedAt: 'DESC' },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Mapper.mapArrayData as jest.Mock).toHaveBeenCalledWith(
        FileDto,
        files,
      );
      expect(result).toEqual(fileDtos);
    });
  });

  describe('getFileById', () => {
    it('should return file by id', async () => {
      const fileDto = new FileDto({
        id: 'file-123',
        name: 'test.pdf',
        extensionType: FileExtensionType.PDF,
        size: 1024,
        s3Bucket: 'test-bucket',
        s3Key: 'users/user-123/uuid-test.pdf',
        userId: 'user-123',
        uploadedAt: new Date(),
      });

      fileRepository.findOne.mockResolvedValue(mockFile);
      jest.spyOn(Mapper, 'mapData').mockReturnValue(fileDto);

      const result = await filesService.getFileById('file-123', 'user-123');

      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', userId: 'user-123' },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Mapper.mapData as jest.Mock).toHaveBeenCalledWith(
        FileDto,
        mockFile,
      );
      expect(result).toEqual(fileDto);
    });

    it('should throw NotFoundException when file not found', async () => {
      fileRepository.findOne.mockResolvedValue(null);

      await expect(
        filesService.getFileById('file-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', userId: 'user-123' },
      });
    });
  });

  describe('generateDownloadUrl', () => {
    it('should generate download URL successfully', async () => {
      const downloadUrl = 'https://s3.example.com/download-url';
      const expectedResponse = new FileDownloadResponseDto({
        downloadUrl,
        expiresIn: 3600,
      });

      fileRepository.findOne.mockResolvedValue(mockFile);
      s3Service.fileExists.mockResolvedValue(true);
      s3Service.generateDownloadUrl.mockResolvedValue(downloadUrl);

      const result = await filesService.generateDownloadUrl(
        'file-123',
        'user-123',
      );

      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', userId: 'user-123' },
      });
      expect(s3Service.fileExists).toHaveBeenCalledWith(mockFile.s3Key);
      expect(s3Service.generateDownloadUrl).toHaveBeenCalledWith(
        mockFile.s3Key,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when file not found', async () => {
      fileRepository.findOne.mockResolvedValue(null);

      await expect(
        filesService.generateDownloadUrl('file-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when file not found in storage', async () => {
      fileRepository.findOne.mockResolvedValue(mockFile);
      s3Service.fileExists.mockResolvedValue(false);

      await expect(
        filesService.generateDownloadUrl('file-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
      expect(s3Service.fileExists).toHaveBeenCalledWith(mockFile.s3Key);
      expect(s3Service.generateDownloadUrl).not.toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      fileRepository.findOne.mockResolvedValue(mockFile);
      s3Service.deleteFile.mockResolvedValue(undefined);
      queryRunner.manager.remove.mockResolvedValue([mockFile]);

      await filesService.deleteFile('file-123', 'user-123');

      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', userId: 'user-123', status: 'COMPLETED' },
      });
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(s3Service.deleteFile).toHaveBeenCalledWith(mockFile.s3Key);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException when file not found', async () => {
      fileRepository.findOne.mockResolvedValue(null);

      await expect(
        filesService.deleteFile('file-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
      expect(fileRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getFileMetadata', () => {
    it('should return file metadata', async () => {
      const fileDto = new FileDto({
        id: 'file-123',
        name: 'test.pdf',
        extensionType: FileExtensionType.PDF,
        size: 1024,
        s3Bucket: 'test-bucket',
        s3Key: 'users/user-123/uuid-test.pdf',
        userId: 'user-123',
        uploadedAt: new Date(),
      });

      fileRepository.findOne.mockResolvedValue(mockFile);
      jest.spyOn(Mapper, 'mapData').mockReturnValue(fileDto);

      const result = await filesService.getFileMetadata('file-123', 'user-123');

      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123', userId: 'user-123' },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Mapper.mapData as jest.Mock).toHaveBeenCalledWith(
        FileDto,
        mockFile,
      );
      expect(result).toEqual(fileDto);
    });
  });
});
