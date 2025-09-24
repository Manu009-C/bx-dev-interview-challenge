import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export interface IFileEntity {
  id: string;
  originalName: string;
  fileName: string; // S3 key
  mimeType: string;
  size: number;
  s3Bucket: string;
  s3Key: string;
  thumbnailUrl?: string;
  user?: User;
  userId: string;
  uploadedAt: Date;
}

@Entity('files')
export class File implements IFileEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  originalName: string;

  @Column()
  @Expose()
  fileName: string; // S3 key

  @Column()
  @Expose()
  mimeType: string;

  @Column('bigint')
  @Expose()
  size: number;

  @Column()
  @Expose()
  s3Bucket: string;

  @Column()
  @Expose()
  s3Key: string;

  @Column({ nullable: true })
  @Expose()
  thumbnailUrl?: string;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'userId' })
  @Expose()
  user?: User;

  @Column()
  @Expose()
  userId: string;

  @CreateDateColumn()
  @Expose()
  uploadedAt: Date;

  constructor(partial: Partial<File>) {
    Object.assign(this, partial);
  }
}
