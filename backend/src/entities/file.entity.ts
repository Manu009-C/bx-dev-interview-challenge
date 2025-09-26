import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum FileExtensionType {
  MP3 = 'MP3',
  PNG = 'PNG',
  JPG = 'JPG',
  PDF = 'PDF',
}

export enum FileStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DELETING = 'DELETING',
  FAILED = 'FAILED',
}

export interface IFileEntity {
  id: string;
  userId: string;
  s3Bucket: string;
  s3Key: string;
  user?: User;
  size: number; // in Megabytes
  name: string;
  extensionType: FileExtensionType;
  status: FileStatus;
  errorMessage?: string;
  uploadedAt: Date;
}

@Entity('files')
export class File implements IFileEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Index()
  @Column()
  @Expose()
  userId: string;

  @Column()
  @Expose()
  s3Bucket: string;

  @Column()
  @Expose()
  s3Key: string;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'userId' })
  @Expose()
  user?: User;

  @Column('decimal', { precision: 10, scale: 2 })
  @Expose()
  size: number; // in Megabytes

  @Column()
  @Expose()
  name: string;

  @Column({
    type: 'enum',
    enum: FileExtensionType,
  })
  @Expose()
  extensionType: FileExtensionType;

  @Index()
  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.PENDING,
  })
  @Expose()
  status: FileStatus;

  @Column({ nullable: true })
  @Expose()
  errorMessage?: string;

  @CreateDateColumn()
  @Expose()
  uploadedAt: Date;

  constructor(partial: Partial<File>) {
    Object.assign(this, partial);
  }
}
