import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
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
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<FileUploadResponseDto> {
    // Ensure user exists or create if not
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload file to S3
    const s3Key = await this.s3Service.uploadFile(file, userId);

    // Save file metadata to database
    const fileEntity = new File({
      originalName: file.originalname,
      fileName: s3Key,
      mimeType: file.mimetype,
      size: file.size,
      s3Bucket: process.env.S3_BUCKET_NAME,
      s3Key: s3Key,
      userId: userId,
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
