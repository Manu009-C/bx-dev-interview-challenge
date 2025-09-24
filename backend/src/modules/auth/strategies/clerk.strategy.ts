import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  given_name?: string;
  firstName?: string;
  family_name?: string;
  lastName?: string;
  picture?: string;
  profileImageUrl?: string;
}

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        process.env.CLERK_PEM_PUBLIC_KEY || process.env.CLERK_JWKS_URL,
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
    } catch {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
