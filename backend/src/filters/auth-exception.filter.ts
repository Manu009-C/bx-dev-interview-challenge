import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException, ForbiddenException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  catch(
    exception: UnauthorizedException | ForbiddenException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `🚫 Auth exception caught: ${status} ${exception.message}`,
    );
    this.logger.error(`📍 Request: ${request.method} ${request.url}`);
    this.logger.error(`🔍 Exception details:`, {
      name: exception.name,
      message: exception.message,
      stack: exception.stack?.split('\n')[0], // Just first line of stack
    });

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      error: status === 401 ? 'Unauthorized' : 'Forbidden',
    };

    this.logger.error(`📤 Sending error response:`, errorResponse);
    response.status(status).json(errorResponse);
  }
}
