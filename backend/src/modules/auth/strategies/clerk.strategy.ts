import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  given_name?: string;
  firstName?: string;
  family_name?: string;
  lastName?: string;
  picture?: string;
  profileImageUrl?: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
  nbf?: number; // Not before
  aud?: string; // Audience
  iss?: string; // Issuer
}

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private readonly logger = new Logger(ClerkStrategy.name);

  constructor() {
    // Create proper PEM format from the base64 key
    const base64Key =
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA55zZWpy/h/6UjrPXq1biZ31hSzw9vyOYuKTUmiqeYPNl/eimksFo0Jupo+rtllpH8+ax6rl6/mexTd9ohOZBmvz5eq0FCwRN/09WjqyEga3bDnu/2QlgM4lvIRXqoO6l67BRBwIXkamdhmfCc2ydob+XppGtf4suchoDZVpbqVp943liqlUGDlk8DLa976wZRhtjAes2HhH9li4PIUL7lJPOFdLu6nbDq7uT6cAPl1JGLOlD8VOsVnh+CEutmhW6HzxKHMB3ySDbsZlRcbuSt1VAtsjoxQI1TyiaHE1Add9rkxoVn7Cf5NVMxBs5k9IcwVwZ+AwSQeiS+0IVs3aU1wIDAQAB';

    // Format it properly with line breaks every 64 characters
    const pemBody = base64Key.match(/.{1,64}/g)?.join('\n') || base64Key;
    const secretOrKey = `-----BEGIN PUBLIC KEY-----\n${pemBody}\n-----END PUBLIC KEY-----`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): ClerkUser {
    try {
      // For JWT strategy, the payload is already verified by Passport
      // We just need to extract the user information from the payload
      const user: ClerkUser = {
        id: payload.sub || payload.userId || '',
        email: payload.email || '',
        firstName: payload.given_name || payload.firstName,
        lastName: payload.family_name || payload.lastName,
        profileImageUrl: payload.picture || payload.profileImageUrl,
      };

      if (!user.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // For other errors (like TypeError from null payload), let them bubble up
      throw error;
    }
  }
}
