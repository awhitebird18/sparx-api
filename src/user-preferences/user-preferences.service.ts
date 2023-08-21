import { Injectable } from '@nestjs/common';
import { UpdateUserpreferenceDto } from './dto/update-user-preferences';
import { UserPreferencessRepository } from './user-preferences.repository';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPreferencesService {
  constructor(private userPreferencesRepository: UserPreferencessRepository) {}

  async createUserPreferences(user: User) {
    return await this.userPreferencesRepository.createUserPreferences(user);
  }

  async findUserPreferences(userId: number) {
    return this.userPreferencesRepository.findOneByProperties({
      user: { id: userId },
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

    // Todo: need to pass in user id
    return await this.findUserPreferences(1);
  }
}
