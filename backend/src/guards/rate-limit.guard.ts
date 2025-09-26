import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import 'reflect-metadata';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Decorator to set rate limit options
export const RateLimit = (options: RateLimitOptions) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata('rateLimit', options, descriptor.value as object);
    } else {
      Reflect.defineMetadata('rateLimit', options, target as object);
    }
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  // In-memory store (use Redis in production)
  private readonly requestCounts = new Map<
    string,
    {
      count: number;
      windowStart: number;
      lastRequest: number;
    }
  >();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<RateLimitOptions>(
      'rateLimit',
      context.getHandler(),
    );

    if (!options) {
      return true; // No rate limiting configured
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = this.getUserId(request);

    if (!userId) {
      // If no user ID available, use IP address
      const identifier = this.getClientIdentifier(request);
      return this.checkRateLimit(identifier, options, 'ip');
    }

    return this.checkRateLimit(userId, options, 'user');
  }

  private checkRateLimit(
    identifier: string,
    options: RateLimitOptions,
    type: 'user' | 'ip',
  ): boolean {
    const now = Date.now();
    const key = `${type}:${identifier}`;

    let requestInfo = this.requestCounts.get(key);

    // Initialize or reset window if expired
    if (!requestInfo || now - requestInfo.windowStart >= options.windowMs) {
      requestInfo = {
        count: 0,
        windowStart: now,
        lastRequest: now,
      };
    }

    // Check if rate limit exceeded
    if (requestInfo.count >= options.maxRequests) {
      const resetTime = new Date(requestInfo.windowStart + options.windowMs);
      const remainingMs = resetTime.getTime() - now;

      this.logger.warn(
        `Rate limit exceeded for ${type} ${identifier}. Limit: ${options.maxRequests}/${options.windowMs}ms. Reset in: ${remainingMs}ms`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            options.message || 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(remainingMs / 1000),
          resetTime: resetTime.toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Update request count
    requestInfo.count++;
    requestInfo.lastRequest = now;
    this.requestCounts.set(key, requestInfo);

    this.logger.debug(
      `Rate limit check passed for ${type} ${identifier}: ${requestInfo.count}/${options.maxRequests}`,
    );

    return true;
  }

  private getUserId(request: AuthenticatedRequest): string | null {
    // Assuming user is attached by auth guard
    return request.user?.id || null;
  }

  private getClientIdentifier(request: Request): string {
    // Get real IP address, considering proxies
    const forwarded = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const requestWithConnection = request;

    const ip: string | undefined =
      requestWithConnection.connection?.remoteAddress ||
      requestWithConnection.socket?.remoteAddress ||
      requestWithConnection.ip;

    if (typeof forwarded === 'string') {
      const firstIp = forwarded.split(',')[0];
      return firstIp ? firstIp.trim() : 'unknown';
    }

    if (typeof realIp === 'string') {
      return realIp;
    }

    return ip || 'unknown';
  }

  // Cleanup old entries periodically (call this from a scheduled job)
  cleanupExpiredEntries(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, info] of this.requestCounts.entries()) {
      if (now - info.lastRequest > maxAge) {
        this.requestCounts.delete(key);
      }
    }

    this.logger.debug(
      `Cleaned up expired rate limit entries. Current size: ${this.requestCounts.size}`,
    );
  }
}
