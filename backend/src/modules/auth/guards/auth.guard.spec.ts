import { Mocked, TestBed } from '@suites/unit';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Mocked<Reflector>;
  let mockContext: Mocked<ExecutionContext>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(JwtAuthGuard).compile();

    guard = unit;
    reflector = unitRef.get(Reflector);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const mockRequest = {
      method: 'GET',
      url: '/test',
      headers: {},
    };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
    };

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
    } as Mocked<ExecutionContext>;
  });

  describe('canActivate', () => {
    it('should return true when route is public', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should call super.canActivate when route is not public', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const superCanActivateSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);
    });

    it('should call super.canActivate when isPublic is undefined', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const superCanActivateSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(false);

      const result = guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(false);
    });
  });
});
