import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { File, FileExtensionType, FileStatus } from '../entities/file.entity';
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
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private s3Service: S3Service,
    private userService: UserService,
    private configService: ConfigService,
    private dataSource: DataSource,
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
    const rollbackActions: Array<() => Promise<void>> = [];
    let queryRunner: QueryRunner | null = null;
    let s3Key: string | null = null;

    try {
      // 1. Validate user exists
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException(
          'User not found. Please ensure user is synced first.',
        );
      }

      // 2. Validate file extension type
      const extensionType = this.getFileExtensionType(
        file.mimetype,
        file.originalname,
      );

      // 3. Check for concurrent upload prevention
      await this.checkConcurrentUpload(userId, file.originalname);

      // 4. Start database transaction
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 5. Create file record with PENDING status
      const s3Config = this.configService.get<{ bucketName: string }>('s3');
      s3Key = `users/${userId}/${Date.now()}-${file.originalname}`;
      const fileEntity = new File({
        userId: userId,
        s3Bucket: s3Config?.bucketName || 'bonusx-bucket',
        s3Key: s3Key,
        size: Number((file.size / (1024 * 1024)).toFixed(2)),
        name: file.originalname,
        extensionType: extensionType,
        status: FileStatus.PENDING,
      });

      const pendingFile = await queryRunner.manager.save(File, fileEntity);
      this.logger.log(`Created pending file record: ${pendingFile.id}`);

      // 6. Upload to S3
      try {
        await this.s3Service.uploadFile(file, userId, s3Key);
        this.logger.log(`Successfully uploaded file to S3: ${s3Key}`);

        // Add S3 cleanup to rollback actions
        rollbackActions.push(async () => {
          if (s3Key) {
            try {
              await this.s3Service.deleteFile(s3Key);
              this.logger.log(`Rolled back S3 file: ${s3Key}`);
            } catch (error) {
              this.logger.error(`Failed to rollback S3 file ${s3Key}:`, error);
            }
          }
        });
      } catch (s3Error) {
        this.logger.error(`S3 upload failed for ${s3Key}:`, s3Error);
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException('File upload to storage failed');
      }

      // 7. Update file status to COMPLETED
      await queryRunner.manager.update(
        File,
        { id: pendingFile.id },
        { status: FileStatus.COMPLETED },
      );

      // 8. Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Successfully completed file upload: ${pendingFile.id}`);

      const completedFile = { ...pendingFile, status: FileStatus.COMPLETED };
      const fileDto = Mapper.mapData(FileDto, completedFile);

      return new FileUploadResponseDto({
        file: fileDto,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      // Rollback database transaction
      if (queryRunner) {
        try {
          await queryRunner.rollbackTransaction();
          this.logger.log(`Rolled back database transaction`);
        } catch (rollbackError) {
          this.logger.error(
            'Failed to rollback database transaction:',
            rollbackError,
          );
        }
      }

      // Execute rollback actions
      await this.executeRollbackActions(rollbackActions);

      // Re-throw original error
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(`File upload failed for user ${userId}:`, error);
      throw new InternalServerErrorException('File upload failed');
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }
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
    let queryRunner: QueryRunner | null = null;
    const rollbackActions: Array<() => Promise<void>> = [];

    try {
      // 1. Find file and verify ownership
      const file = await this.fileRepository.findOne({
        where: { id: fileId, userId, status: FileStatus.COMPLETED },
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // 2. Start transaction
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 3. Mark file as DELETING
      await queryRunner.manager.update(
        File,
        { id: fileId },
        { status: FileStatus.DELETING },
      );
      this.logger.log(`Marked file as deleting: ${fileId}`);

      // 4. Delete from database first
      await queryRunner.manager.remove(File, file);
      this.logger.log(`Removed file from database: ${fileId}`);

      // Add database restoration to rollback actions
      rollbackActions.push(async () => {
        try {
          await this.fileRepository.save({
            ...file,
            status: FileStatus.COMPLETED,
          });
          this.logger.log(`Restored file to database: ${fileId}`);
        } catch (error) {
          this.logger.error(
            `Failed to restore file ${fileId} to database:`,
            error,
          );
        }
      });

      // 5. Delete from S3
      try {
        await this.s3Service.deleteFile(file.s3Key);
        this.logger.log(`Deleted file from S3: ${file.s3Key}`);
      } catch (s3Error) {
        this.logger.error(
          `Failed to delete file from S3: ${file.s3Key}`,
          s3Error,
        );
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          'Failed to delete file from storage',
        );
      }

      // 6. Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Successfully deleted file: ${fileId}`);
    } catch (error) {
      // Rollback database changes
      if (queryRunner) {
        try {
          await queryRunner.rollbackTransaction();
          this.logger.log(
            `Rolled back database transaction for file deletion: ${fileId}`,
          );
        } catch (rollbackError) {
          this.logger.error(
            'Failed to rollback delete transaction:',
            rollbackError,
          );
        }
      }

      // Execute rollback actions
      await this.executeRollbackActions(rollbackActions);

      // Re-throw original error
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`File deletion failed for ${fileId}:`, error);
      throw new InternalServerErrorException('File deletion failed');
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  async getFileMetadata(fileId: string, userId: string): Promise<FileDto> {
    return this.getFileById(fileId, userId);
  }

  /**
   * Check for concurrent uploads by the same user with the same filename
   */
  private async checkConcurrentUpload(
    userId: string,
    fileName: string,
  ): Promise<void> {
    const existingPendingFile = await this.fileRepository.findOne({
      where: {
        userId,
        name: fileName,
        status: FileStatus.PENDING,
      },
    });

    if (existingPendingFile) {
      throw new ConflictException(
        'A file with the same name is currently being uploaded. Please wait or choose a different name.',
      );
    }
  }

  /**
   * Execute rollback actions in reverse order
   */
  private async executeRollbackActions(
    actions: Array<() => Promise<void>>,
  ): Promise<void> {
    const reversedActions = actions.reverse();
    for (const action of reversedActions) {
      try {
        await action();
      } catch (error) {
        this.logger.error('Rollback action failed:', error);
        // Continue with other rollback actions even if one fails
      }
    }
  }
}
