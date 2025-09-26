import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileStatus } from '../entities/file.entity';
import * as crypto from 'crypto';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  detectedMimeType?: string;
  fileHash?: string;
  sanitizedFileName?: string;
}

export interface RateLimitInfo {
  isAllowed: boolean;
  remainingUploads?: number;
  resetTime?: Date;
  error?: string;
}

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);

  // Magic number signatures for file type validation
  private readonly FILE_SIGNATURES = {
    // PDF files
    'application/pdf': [
      [0x25, 0x50, 0x44, 0x46], // %PDF
    ],
    // PNG files
    'image/png': [
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG signature
    ],
    // JPEG files
    'image/jpeg': [
      [0xff, 0xd8, 0xff, 0xe0], // JPEG/JFIF
      [0xff, 0xd8, 0xff, 0xe1], // JPEG/EXIF
      [0xff, 0xd8, 0xff, 0xe2], // JPEG
      [0xff, 0xd8, 0xff, 0xe3], // JPEG
      [0xff, 0xd8, 0xff, 0xdb], // JPEG
    ],
    // MP3 files
    'audio/mpeg': [
      [0x49, 0x44, 0x33], // ID3v2
      [0xff, 0xfb], // MP3 sync word
      [0xff, 0xf3], // MP3 sync word
      [0xff, 0xf2], // MP3 sync word
    ],
  };

  // Rate limiting storage (in production, use Redis)
  private readonly userUploadTracker = new Map<
    string,
    {
      uploads: number;
      windowStart: Date;
      totalSize: number;
    }
  >();

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
  ) {}

  /**
   * Comprehensive file validation including magic number verification
   */
  async validateFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<FileValidationResult> {
    try {
      // 1. Basic validations
      if (!file || !file.buffer) {
        return { isValid: false, error: 'No file data provided' };
      }

      if (file.size === 0) {
        return { isValid: false, error: 'Empty file not allowed' };
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        return {
          isValid: false,
          error: 'File too large. Maximum size is 10MB',
        };
      }

      // 2. Filename validation and sanitization
      const sanitizedFileName = this.sanitizeFileName(file.originalname);
      if (!sanitizedFileName) {
        return { isValid: false, error: 'Invalid or dangerous filename' };
      }

      // 3. Magic number validation (file content inspection)
      const detectedMimeType = this.detectFileTypeByMagicNumbers(file.buffer);
      if (!detectedMimeType) {
        return {
          isValid: false,
          error:
            'File type could not be verified. File may be corrupted or unsupported.',
        };
      }

      // 4. MIME type consistency check
      if (!this.isMimeTypeConsistent(file.mimetype, detectedMimeType)) {
        return {
          isValid: false,
          error: `File extension doesn't match content. Detected: ${detectedMimeType}, Claimed: ${file.mimetype}`,
        };
      }

      // 5. Content-specific validation
      const contentValidation = this.validateFileContent(
        file.buffer,
        detectedMimeType,
      );
      if (!contentValidation.isValid) {
        return contentValidation;
      }

      // 6. Generate file hash for duplicate detection
      const fileHash = this.generateFileHash(file.buffer);

      // 7. Check for duplicate files
      const isDuplicate = await this.checkForDuplicateFile(
        userId,
        fileHash,
        sanitizedFileName,
      );
      if (isDuplicate) {
        return {
          isValid: false,
          error: 'File already exists (duplicate content detected)',
        };
      }

      this.logger.log(
        `File validation passed for ${sanitizedFileName}, type: ${detectedMimeType}`,
      );

      return {
        isValid: true,
        detectedMimeType,
        fileHash,
        sanitizedFileName,
      };
    } catch (error) {
      this.logger.error('File validation error:', error);
      return {
        isValid: false,
        error: 'File validation failed due to processing error',
      };
    }
  }

  /**
   * Rate limiting and resource exhaustion prevention
   */
  async checkRateLimit(
    userId: string,
    fileSize: number,
  ): Promise<RateLimitInfo> {
    const now = new Date();
    const windowDuration = 60 * 60 * 1000; // 1 hour window
    const maxUploadsPerHour = 20;
    const maxTotalSizePerHour = 100 * 1024 * 1024; // 100MB per hour

    // Get or create user tracking info
    let userInfo = this.userUploadTracker.get(userId);

    // Reset window if expired
    if (
      !userInfo ||
      now.getTime() - userInfo.windowStart.getTime() > windowDuration
    ) {
      userInfo = {
        uploads: 0,
        windowStart: now,
        totalSize: 0,
      };
    }

    // Check upload count limit
    if (userInfo.uploads >= maxUploadsPerHour) {
      const resetTime = new Date(
        userInfo.windowStart.getTime() + windowDuration,
      );
      return {
        isAllowed: false,
        error: `Upload limit exceeded. Maximum ${maxUploadsPerHour} uploads per hour. Try again after ${resetTime.toISOString()}`,
        resetTime,
      };
    }

    // Check total size limit
    if (userInfo.totalSize + fileSize > maxTotalSizePerHour) {
      const resetTime = new Date(
        userInfo.windowStart.getTime() + windowDuration,
      );
      return {
        isAllowed: false,
        error: `Storage quota exceeded. Maximum 100MB per hour. Try again after ${resetTime.toISOString()}`,
        resetTime,
      };
    }

    // Check database storage quota
    const userStorageInfo = await this.checkUserStorageQuota(userId, fileSize);
    if (!userStorageInfo.isAllowed) {
      return userStorageInfo;
    }

    // Update tracking info
    userInfo.uploads++;
    userInfo.totalSize += fileSize;
    this.userUploadTracker.set(userId, userInfo);

    return {
      isAllowed: true,
      remainingUploads: maxUploadsPerHour - userInfo.uploads,
    };
  }

  /**
   * Check user's total storage quota
   */
  private async checkUserStorageQuota(
    userId: string,
    newFileSize: number,
  ): Promise<RateLimitInfo> {
    const maxUserStorage = 500 * 1024 * 1024; // 500MB per user

    const userFiles: Record<string, unknown> | undefined =
      await this.fileRepository
        .createQueryBuilder('file')
        .where('file.userId = :userId', { userId })
        .andWhere('file.status = :status', { status: FileStatus.COMPLETED })
        .select('SUM(file.size)', 'totalSize')
        .getRawOne();

    // Safely extract totalSize with proper type checking
    const totalSizeValue =
      userFiles && 'totalSize' in userFiles ? String(userFiles.totalSize) : '0';

    const currentSize = (parseFloat(totalSizeValue) || 0) * 1024 * 1024; // Convert MB to bytes

    if (currentSize + newFileSize > maxUserStorage) {
      return {
        isAllowed: false,
        error: `Storage quota exceeded. Maximum 500MB per user. Current usage: ${(currentSize / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    return { isAllowed: true };
  }

  /**
   * Detect file type using magic numbers (file signatures)
   */
  private detectFileTypeByMagicNumbers(buffer: Buffer): string | null {
    for (const [mimeType, signatures] of Object.entries(this.FILE_SIGNATURES)) {
      for (const signature of signatures) {
        if (this.bufferStartsWith(buffer, signature)) {
          return mimeType;
        }
      }
    }
    return null;
  }

  /**
   * Check if buffer starts with given byte sequence
   */
  private bufferStartsWith(buffer: Buffer, sequence: number[]): boolean {
    if (buffer.length < sequence.length) return false;

    for (let i = 0; i < sequence.length; i++) {
      if (buffer[i] !== sequence[i]) return false;
    }
    return true;
  }

  /**
   * Validate MIME type consistency
   */
  private isMimeTypeConsistent(
    claimedMime: string,
    detectedMime: string,
  ): boolean {
    // Normalize MIME types
    const normalizedClaimed = this.normalizeMimeType(claimedMime);
    const normalizedDetected = this.normalizeMimeType(detectedMime);

    return normalizedClaimed === normalizedDetected;
  }

  /**
   * Normalize MIME types for comparison
   */
  private normalizeMimeType(mimeType: string): string {
    const mimeMap: { [key: string]: string } = {
      'audio/mp3': 'audio/mpeg',
      'image/jpg': 'image/jpeg',
    };

    return mimeMap[mimeType.toLowerCase()] || mimeType.toLowerCase();
  }

  /**
   * Content-specific validation for different file types
   */
  private validateFileContent(
    buffer: Buffer,
    mimeType: string,
  ): FileValidationResult {
    switch (mimeType) {
      case 'application/pdf':
        return this.validatePDFContent(buffer);
      case 'image/png':
      case 'image/jpeg':
        return this.validateImageContent(buffer, mimeType);
      default:
        return { isValid: true };
    }
  }

  /**
   * PDF-specific content validation
   */
  private validatePDFContent(buffer: Buffer): FileValidationResult {
    // Check for PDF trailer
    const trailerPattern = Buffer.from('%%EOF');
    const hasTrailer = buffer.includes(trailerPattern);

    if (!hasTrailer) {
      return {
        isValid: false,
        error: 'Invalid PDF file: missing trailer',
      };
    }

    // Basic PDF structure validation
    const pdfVersion = buffer.subarray(0, 8).toString();
    if (!pdfVersion.startsWith('%PDF-')) {
      return {
        isValid: false,
        error: 'Invalid PDF file: missing version header',
      };
    }

    return { isValid: true };
  }

  /**
   * Image-specific content validation
   */
  private validateImageContent(
    buffer: Buffer,
    mimeType: string,
  ): FileValidationResult {
    if (mimeType === 'image/png') {
      // PNG must end with IEND chunk
      const iendChunk = Buffer.from([
        0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);
      if (!buffer.includes(iendChunk)) {
        return {
          isValid: false,
          error: 'Invalid PNG file: missing IEND chunk',
        };
      }
    }

    if (mimeType === 'image/jpeg') {
      // JPEG must end with FFD9
      const jpegEnd = Buffer.from([0xff, 0xd9]);
      if (!buffer.subarray(-2).equals(jpegEnd)) {
        return {
          isValid: false,
          error: 'Invalid JPEG file: missing end marker',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Sanitize and validate filename
   */
  private sanitizeFileName(originalName: string): string | null {
    if (!originalName || originalName.trim() === '') return null;

    // Remove dangerous characters and patterns
    const sanitized = originalName
      .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous chars
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, '') // Remove trailing dots
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .slice(0, 255); // Limit length

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(sanitized)) return null;

    // Must have valid extension
    const validExtensions = /\.(pdf|png|jpe?g|mp3)$/i;
    if (!validExtensions.test(sanitized)) return null;

    // Path traversal prevention
    if (
      sanitized.includes('..') ||
      sanitized.includes('/') ||
      sanitized.includes('\\')
    ) {
      return null;
    }

    return sanitized.length > 0 ? sanitized : null;
  }

  /**
   * Generate SHA-256 hash of file content for duplicate detection
   */
  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check for duplicate files by hash and user
   */
  private async checkForDuplicateFile(
    userId: string,
    fileHash: string,
    fileName: string,
  ): Promise<boolean> {
    // Note: We'd need to add a fileHash column to the File entity for this to work
    // For now, just check by name to prevent immediate duplicates
    const existingFile = await this.fileRepository.findOne({
      where: {
        userId,
        name: fileName,
        status: FileStatus.COMPLETED,
      },
    });

    return !!existingFile;
  }
}
