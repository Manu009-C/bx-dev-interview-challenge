import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import getCommonConfig from './configs/common';
import { AppController } from './controllers/app.controller';
import { FilesController } from './controllers/files.controller';
import { AppService } from './services/app/app.service';
import { FilesService } from './services/files.service';
import { S3Service } from './services/s3.service';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { File } from './entities/file.entity';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getCommonConfig] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, File],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([User, File]),
    AuthModule,
  ],
  controllers: [AppController, FilesController],
  providers: [AppService, FilesService, S3Service, UserService],
})
export class AppModule {}
