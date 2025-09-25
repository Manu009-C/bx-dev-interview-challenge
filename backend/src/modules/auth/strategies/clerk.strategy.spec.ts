import { TestBed } from '@suites/unit';
import { UnauthorizedException } from '@nestjs/common';
import { ClerkStrategy, JwtPayload } from './clerk.strategy';

describe('ClerkStrategy', () => {
  let strategy: ClerkStrategy;

  beforeAll(async () => {
    const { unit } = await TestBed.solitary(ClerkStrategy).compile();
    strategy = unit;
  });

  describe('validate', () => {
    it('should return ClerkUser with valid payload', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        picture: 'https://example.com/avatar.jpg',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: 'https://example.com/avatar.jpg',
      });
    });

    it('should return ClerkUser with alternative payload fields', () => {
      const payload = {
        userId: 'user-456',
        email: 'test2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        profileImageUrl: 'https://example.com/avatar2.jpg',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-456',
        email: 'test2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        profileImageUrl: 'https://example.com/avatar2.jpg',
      });
    });

    it('should handle missing optional fields', () => {
      const payload = {
        sub: 'user-789',
        email: 'test3@example.com',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-789',
        email: 'test3@example.com',
        firstName: undefined,
        lastName: undefined,
        profileImageUrl: undefined,
      });
    });

    it('should throw UnauthorizedException when id is missing', () => {
      const payload = {
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
      };

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when id is empty string', () => {
      const payload = {
        sub: '',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
      };

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when payload is invalid', () => {
      const payload = null as unknown as JwtPayload;

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when payload throws error', () => {
      const payload = {
        get id() {
          throw new Error('Test error');
        },
        email: 'test@example.com',
      };

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });
  });
});
