import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { File, FileExtensionType } from '../entities/file.entity';
import { User } from '../entities/user.entity';
import { S3Service } from './s3.service';
import { UserService } from './user.service';
import { Mapper } from '../utils/mapper/mapper';
import {
  FileDto,
  FileUploadResponseDto,
  FileDownloadResponseDto,
} from '../dtos/file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private s3Service: S3Service,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  private getFileExtensionType(
    mimeType: string,
    fileName: string,
  ): FileExtensionType {
    // Get file extension from filename
    const extension = fileName.split('.').pop()?.toUpperCase();

    // Map mime types and extensions to our enum
    const mimeToExtension: { [key: string]: FileExtensionType } = {
      'audio/mpeg': FileExtensionType.MP3,
      'audio/mp3': FileExtensionType.MP3,
      'image/png': FileExtensionType.PNG,
      'image/jpeg': FileExtensionType.JPG,
      'image/jpg': FileExtensionType.JPG,
      'application/pdf': FileExtensionType.PDF,
    };

    // Check by mime type first
    if (mimeToExtension[mimeType]) {
      return mimeToExtension[mimeType];
    }

    // Check by file extension
    if (
      extension &&
      Object.values(FileExtensionType).includes(extension as FileExtensionType)
    ) {
      return extension as FileExtensionType;
    }

    throw new BadRequestException(
      `Unsupported file type. Only MP3, PNG, JPG, and PDF files are allowed.`,
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<FileUploadResponseDto> {
    // Note: We'll rely on the frontend to sync user via /api/sync-user endpoint
    // before attempting file upload, so user should already exist
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(
        'User not found. Please ensure user is synced first.',
      );
    }

    // Validate file extension type
    const extensionType = this.getFileExtensionType(
      file.mimetype,
      file.originalname,
    );

    // Upload file to S3
    const s3Key = await this.s3Service.uploadFile(file, userId);

    // Convert size from bytes to megabytes
    const sizeInMB = Number((file.size / (1024 * 1024)).toFixed(2));

    // Save file metadata to database
    const s3Config = this.configService.get<{ bucketName: string }>('s3');
    const fileEntity = new File({
      userId: userId,
      s3Bucket: s3Config?.bucketName || 'bonusx-bucket',
      s3Key: s3Key,
      size: sizeInMB,
      name: file.originalname,
      extensionType: extensionType,
    });

    const savedFile = await this.fileRepository.save(fileEntity);
    const fileDto = Mapper.mapData(FileDto, savedFile);

    return new FileUploadResponseDto({
      file: fileDto,
      message: 'File uploaded successfully',
    });
  }

  async getUserFiles(userId: string): Promise<FileDto[]> {
    const files = await this.fileRepository.find({
      where: { userId },
      order: { uploadedAt: 'DESC' },
    });

    return Mapper.mapArrayData(FileDto, files);
  }

  async getFileById(fileId: string, userId: string): Promise<FileDto> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return Mapper.mapData(FileDto, file);
  }

  async generateDownloadUrl(
    fileId: string,
    userId: string,
  ): Promise<FileDownloadResponseDto> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if file exists in S3
    const exists = await this.s3Service.fileExists(file.s3Key);
    if (!exists) {
      throw new NotFoundException('File not found in storage');
    }

    const downloadUrl = await this.s3Service.generateDownloadUrl(file.s3Key);

    return new FileDownloadResponseDto({
      downloadUrl,
      expiresIn: 3600, // 1 hour
    });
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Delete from S3
    await this.s3Service.deleteFile(file.s3Key);

    // Delete from database
    await this.fileRepository.remove(file);
  }

  async getFileMetadata(fileId: string, userId: string): Promise<FileDto> {
    return this.getFileById(fileId, userId);
  }
}
