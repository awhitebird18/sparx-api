import { Injectable } from '@nestjs/common';
import { UpdateUserpreferenceDto } from './dto/update-user-preferences';
import { UserPreferencessRepository } from './user-preferences.repository';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserpreferencesService {
  constructor(private userPreferencesRepository: UserPreferencessRepository) {}

  async createUserPreferences(user: User) {
    return await this.userPreferencesRepository.createUserPreferences(user);
  }

  findUserPreferences(userId: string) {
    return this.userPreferencesRepository.findOneByProperties({
      user: { uuid: userId },
    });
  }

  async update(
    userId: string,
    updateUserpreferenceDto: UpdateUserpreferenceDto,
  ) {
    await this.userPreferencesRepository.updateUserPreferences(
      userId,
      updateUserpreferenceDto,
    );

    return await this.findUserPreferences(userId);
  }
}
