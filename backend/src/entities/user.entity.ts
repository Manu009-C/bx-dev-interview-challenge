import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from './file.entity';

export interface IUserEntity {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  files?: File[];
  createdAt: Date;
  updatedAt: Date;
}

@Entity('users')
export class User implements IUserEntity {
  @PrimaryColumn()
  @Expose()
  id: string; // Clerk user ID

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column({ nullable: true })
  @Expose()
  firstName?: string;

  @Column({ nullable: true })
  @Expose()
  lastName?: string;

  @Column({ nullable: true })
  @Expose()
  profileImageUrl?: string;

  @OneToMany('File', 'user')
  @Expose()
  files?: File[];

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
