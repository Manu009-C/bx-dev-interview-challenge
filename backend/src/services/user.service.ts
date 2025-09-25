import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreateUser(clerkUser: ClerkUser): Promise<User> {
    // Try to find existing user
    let user = await this.userRepository.findOne({
      where: { id: clerkUser.id },
    });

    if (!user) {
      // Create new user if not found
      user = new User({
        id: clerkUser.id,
        email: clerkUser.email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.profileImageUrl,
      });

      user = await this.userRepository.save(user);
    } else {
      // Update existing user with latest Clerk data
      user.email = clerkUser.email;
      user.firstName = clerkUser.firstName;
      user.lastName = clerkUser.lastName;
      user.profileImageUrl = clerkUser.profileImageUrl;

      user = await this.userRepository.save(user);
    }

    return user;
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async updateUser(
    userId: string,
    updateData: Partial<ClerkUser>,
  ): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }
}
