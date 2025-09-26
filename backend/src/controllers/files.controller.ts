import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../services/files.service';
import {
  FileUploadResponseDto,
  FileDownloadResponseDto,
  FileDto,
} from '../dtos/file.dto';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';

// File filter function - restrict to only MP3, PNG, JPG, and PDF
const fileFilter = (
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

  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException('Only MP3, PNG, JPG, and PDF files are allowed'),
      false,
    );
  }
};

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: fileFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: ClerkUser,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadFile(file, user.id);
  }

  @Get()
  async getUserFiles(@CurrentUser() user: ClerkUser): Promise<any[]> {
    return this.filesService.getUserFiles(user.id);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: ClerkUser,
  ): Promise<FileDownloadResponseDto> {
    return this.filesService.generateDownloadUrl(id, user.id);
  }

  @Get(':id/metadata')
  async getFileMetadata(
    @Param('id') id: string,
    @CurrentUser() user: ClerkUser,
  ): Promise<FileDto> {
    return this.filesService.getFileMetadata(id, user.id);
  }

  @Delete(':id')
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() user: ClerkUser,
  ): Promise<{ message: string }> {
    await this.filesService.deleteFile(id, user.id);
    return { message: 'File deleted successfully' };
  }
}
