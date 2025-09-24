import { Mocked, TestBed } from '@suites/unit';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { ClerkUser } from '../modules/auth/strategies/clerk.strategy';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Mocked<Repository<User>>;

  const mockClerkUser: ClerkUser = {
    id: 'clerk-user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://example.com/avatar.jpg',
  };

  const mockUser: User = {
    id: 'clerk-user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    userService = unit;
    userRepository = unitRef.get('UserRepository');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreateUser', () => {
    it('should return existing user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await userService.findOrCreateUser(mockClerkUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockClerkUser.id },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockClerkUser.email,
          firstName: mockClerkUser.firstName,
          lastName: mockClerkUser.lastName,
          profileImageUrl: mockClerkUser.profileImageUrl,
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should create new user when not found', async () => {
      const newUser = { ...mockUser };
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(newUser);

      const result = await userService.findOrCreateUser(mockClerkUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockClerkUser.id },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockClerkUser.id,
          email: mockClerkUser.email,
          firstName: mockClerkUser.firstName,
          lastName: mockClerkUser.lastName,
          profileImageUrl: mockClerkUser.profileImageUrl,
        }),
      );
      expect(result).toEqual(newUser);
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findUserById('user-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.findUserById('user-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData: Partial<ClerkUser> = {
        email: 'updated@example.com',
        firstName: 'Jane',
      };
      const updatedUser = { ...mockUser, ...updateData };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user-123', updateData);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          ...updateData,
        }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      const updateData: Partial<ClerkUser> = {
        email: 'updated@example.com',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        userService.updateUser('user-123', updateData),
      ).rejects.toThrow('User not found');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
