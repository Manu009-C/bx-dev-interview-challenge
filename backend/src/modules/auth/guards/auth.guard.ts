import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('clerk') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const authHeader = request.headers['authorization'] as string;

    this.logger.log(`🚪 Auth guard triggered: ${method} ${url}`);
    this.logger.log(
      `🔑 Authorization header: ${authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'NOT PRESENT'}`,
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('🌐 Route is public - skipping authentication');
      return true;
    }

    this.logger.log('🔒 Route is protected - starting JWT validation');
    const result = super.canActivate(context);

    if (result instanceof Promise) {
      return result.then(
        (success) => {
          this.logger.log(
            `✅ Authentication ${success ? 'successful' : 'failed'}`,
          );
          return success;
        },
        (error) => {
          this.logger.error(
            '❌ Authentication failed with error:',
            error.message as string,
          );
          throw error;
        },
      );
    } else {
      this.logger.log(
        `✅ Authentication ${result ? 'successful' : 'failed'} (sync)`,
      );
      return result;
    }
  }
}
