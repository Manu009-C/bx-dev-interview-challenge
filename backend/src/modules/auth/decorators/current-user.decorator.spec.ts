import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { ClerkUser } from '../strategies/clerk.strategy';

describe('CurrentUser', () => {
  it('should return a decorator function', () => {
    const mockUser: ClerkUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: 'https://example.com/avatar.jpg',
    };

    const mockRequest = {
      user: mockUser,
    };

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    const decorator = CurrentUser(null, mockContext);

    expect(typeof decorator).toBe('function');
  });

  it('should return a decorator function when no user in request', () => {
    const mockRequest = {};

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    const decorator = CurrentUser(null, mockContext);

    expect(typeof decorator).toBe('function');
  });
});
