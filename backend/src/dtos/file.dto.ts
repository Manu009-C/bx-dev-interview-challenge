import { Expose } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { FileExtensionType } from '../entities/file.entity';

export interface IFileDto {
  id: string;
  userId: string;
  s3Bucket: string;
  s3Key: string;
  size: number; // in Megabytes
  name: string;
  extensionType: FileExtensionType;
  uploadedAt: Date;
}

export class FileDto implements IFileDto {
  @IsUUID()
  @Expose()
  id: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  s3Bucket: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  s3Key: string;

  @IsNumber()
  @Expose()
  size: number; // in Megabytes

  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @IsEnum(FileExtensionType)
  @Expose()
  extensionType: FileExtensionType;

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
