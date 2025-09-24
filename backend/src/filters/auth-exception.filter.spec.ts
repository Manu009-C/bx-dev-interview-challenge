import { Mocked, TestBed } from '@suites/unit';
import {
  UnauthorizedException,
  ForbiddenException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthExceptionFilter } from './auth-exception.filter';

describe('AuthExceptionFilter', () => {
  let filter: AuthExceptionFilter;
  let mockResponse: Mocked<Response>;

  beforeAll(async () => {
    const { unit } = await TestBed.solitary(AuthExceptionFilter).compile();
    filter = unit;
  });

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Mocked<Response>;
  });

  describe('catch', () => {
    it('should handle UnauthorizedException', () => {
      const exception = new UnauthorizedException('Invalid token');
      const mockRequest = { url: '/api/test' };
      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as Mocked<ArgumentsHost>;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
        path: '/api/test',
        message: 'Invalid token',
        error: 'Unauthorized',
      });
    });

    it('should handle ForbiddenException', () => {
      const exception = new ForbiddenException('Access denied');
      const mockRequest = { url: '/api/protected' };
      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as Mocked<ArgumentsHost>;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 403,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
        path: '/api/protected',
        message: 'Access denied',
        error: 'Forbidden',
      });
    });

    it('should handle exception without message', () => {
      const exception = new UnauthorizedException();
      const mockRequest = { url: '/api/test' };
      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as Mocked<ArgumentsHost>;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 401,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
        path: '/api/test',
        message: 'Unauthorized',
        error: 'Unauthorized',
      });
    });
  });
});
