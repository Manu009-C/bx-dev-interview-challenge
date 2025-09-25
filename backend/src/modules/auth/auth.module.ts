import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { JwtAuthGuard } from './guards/auth.guard';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User])],
  providers: [ClerkStrategy, UserService, JwtAuthGuard],
  exports: [UserService, JwtAuthGuard],
})
export class AuthModule {}
