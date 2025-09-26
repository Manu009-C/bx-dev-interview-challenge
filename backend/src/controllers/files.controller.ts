import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  BadRequestException,
  PayloadTooLargeException,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../services/files.service';
import { FileValidationService } from '../services/file-validation.service';
import {
  FileUploadResponseDto,
  FileDownloadResponseDto,
  FileDto,
} from '../dtos/file.dto';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';
import { RateLimitGuard, RateLimit } from '../guards/rate-limit.guard';

// Enhanced file filter with better error handling
const enhancedFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: any, success: boolean) => void,
) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
  ];

  // Basic MIME type check (will be enhanced by FileValidationService)
  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        `File type '${file.mimetype}' not allowed. Only MP3, PNG, JPG, and PDF files are supported.`,
      ),
      false,
    );
  }
};

@Controller('files')
@UseGuards(RateLimitGuard)
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(
    private readonly filesService: FilesService,
    private readonly fileValidationService: FileValidationService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour per user
    message: 'Upload limit exceeded. Maximum 20 uploads per hour allowed.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1, // Only one file at a time
        fieldSize: 1024, // Limit field size
        fieldNameSize: 100, // Limit field name size
        fields: 10, // Limit number of fields
      },
      fileFilter: enhancedFileFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: ClerkUser,
  ): Promise<FileUploadResponseDto> {
    const startTime = Date.now();
    this.logger.log(
      `Upload started for user ${user.id}, file: ${file?.originalname}`,
    );

    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Rate limiting check
      const rateLimitResult = await this.fileValidationService.checkRateLimit(
        user.id,
        file.size,
      );

      if (!rateLimitResult.isAllowed) {
        throw new PayloadTooLargeException(rateLimitResult.error);
      }

      this.logger.log(
        `Rate limit check passed. Remaining uploads: ${rateLimitResult.remainingUploads}`,
      );

      // Comprehensive file validation
      const validationResult = await this.fileValidationService.validateFile(
        file,
        user.id,
      );

      if (!validationResult.isValid) {
        throw new BadRequestException(validationResult.error);
      }

      this.logger.log(
        `File validation passed for ${validationResult.sanitizedFileName}, ` +
          `detected type: ${validationResult.detectedMimeType}, ` +
          `hash: ${validationResult.fileHash?.substring(0, 8)}...`,
      );

      // Use sanitized filename for upload
      const sanitizedFile = {
        ...file,
        originalname: validationResult.sanitizedFileName!,
      };

      const result = await this.filesService.uploadFile(sanitizedFile, user.id);

      const duration = Date.now() - startTime;
      this.logger.log(`Upload completed for user ${user.id} in ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Upload failed for user ${user.id} after ${duration}ms:`,
        (error as Error).message,
      );
      throw error;
    }
  }

  @Get()
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many file list requests. Please slow down.',
  })
  async getUserFiles(@CurrentUser() user: ClerkUser): Promise<any[]> {
    const startTime = Date.now();
    try {
      const files = await this.filesService.getUserFiles(user.id);
      const duration = Date.now() - startTime;
      this.logger.log(
        `Retrieved ${files.length} files for user ${user.id} in ${duration}ms`,
      );
      return files;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to retrieve files for user ${user.id} after ${duration}ms:`,
        (error as Error).message,
      );
      throw error;
    }
  }

  @Get(':id/download')
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 downloads per minute
    message: 'Download limit exceeded. Please slow down.',
  })
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: ClerkUser,
  ): Promise<FileDownloadResponseDto> {
    const startTime = Date.now();
    try {
      // Basic ID validation
      if (!id || id.trim() === '' || !/^[a-f0-9-]{36}$/i.test(id)) {
        throw new BadRequestException('Invalid file ID format');
      }

      const result = await this.filesService.generateDownloadUrl(id, user.id);
      const duration = Date.now() - startTime;
      this.logger.log(`Generated download URL for file ${id} in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to generate download URL for file ${id} after ${duration}ms:`,
        (error as Error).message,
      );
      throw error;
    }
  }

  @Get(':id/metadata')
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 metadata requests per minute
    message: 'Metadata request limit exceeded.',
  })
  async getFileMetadata(
    @Param('id') id: string,
    @CurrentUser() user: ClerkUser,
  ): Promise<FileDto> {
    // Enhanced ID validation
    if (!id || id.trim() === '' || !/^[a-f0-9-]{36}$/i.test(id)) {
      throw new BadRequestException('Invalid file ID format');
    }

    return this.filesService.getFileMetadata(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 deletes per minute
    message: 'Delete limit exceeded. Please slow down.',
  })
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() user: ClerkUser,
  ): Promise<{ message: string }> {
    const startTime = Date.now();
    this.logger.log(`Delete started for file ${id} by user ${user.id}`);

    try {
      // Enhanced ID validation
      if (!id || id.trim() === '' || !/^[a-f0-9-]{36}$/i.test(id)) {
        throw new BadRequestException('Invalid file ID format');
      }

      await this.filesService.deleteFile(id, user.id);

      const duration = Date.now() - startTime;
      this.logger.log(`Delete completed for file ${id} in ${duration}ms`);

      return { message: 'File deleted successfully' };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Delete failed for file ${id} after ${duration}ms:`,
        (error as Error).message,
      );
      throw error;
    }
  }
}
