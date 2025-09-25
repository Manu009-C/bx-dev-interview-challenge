import { Expose } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';

export interface IFileDto {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Bucket: string;
  s3Key: string;
  thumbnailUrl?: string;
  userId: string;
  uploadedAt: Date;
}

export class FileDto implements IFileDto {
  @IsUUID()
  @Expose()
  id: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  mimeType: string;

  @IsNumber()
  @Expose()
  size: number;

  @IsString()
  @IsNotEmpty()
  @Expose()
  s3Bucket: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  s3Key: string;

  @IsString()
  @IsOptional()
  @Expose()
  thumbnailUrl?: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  userId: string;

  @Expose()
  uploadedAt: Date;

  constructor(partial: Partial<FileDto>) {
    Object.assign(this, partial);
  }
}

export interface IFileUploadResponseDto {
  file: FileDto;
  message: string;
}

export class FileUploadResponseDto implements IFileUploadResponseDto {
  @Expose()
  file: FileDto;

  @IsString()
  @IsNotEmpty()
  @Expose()
  message: string;

  constructor(partial: Partial<FileUploadResponseDto>) {
    Object.assign(this, partial);
  }
}

export interface IFileDownloadResponseDto {
  downloadUrl: string;
  expiresIn: number;
}

export class FileDownloadResponseDto implements IFileDownloadResponseDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  downloadUrl: string;

  @IsNumber()
  @Expose()
  expiresIn: number;

  constructor(partial: Partial<FileDownloadResponseDto>) {
    Object.assign(this, partial);
  }
}
