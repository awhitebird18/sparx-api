import { Injectable } from '@nestjs/common';

import { UserPreferencessRepository } from './user-preferences.repository';

import { UpdateUserPreferencesDto } from './dto/update-user-preferences';
import { CreateUserPreferences } from './dto/create-user-preferences.dto';
import { UserPreferences } from './entities/user-preference.entity';

@Injectable()
export class UserPreferencesService {
  constructor(private userPreferencesRepository: UserPreferencessRepository) {}

  createUserPreferences(createUserPreferences: CreateUserPreferences) {
    return this.userPreferencesRepository.createUserPreferences(
      createUserPreferences,
    );
  }

  findUserPreferences(userId: number): Promise<UserPreferences> {
    return this.userPreferencesRepository.findOne({
      where: { userId },
    });
  }

  async update(
    userId: number,
    updateUserpreferenceDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferences> {
    const userPreferences =
      await this.userPreferencesRepository.findUserPreferences(userId);

    Object.assign(userPreferences, updateUserpreferenceDto);

    const updatedUserPreferences =
      this.userPreferencesRepository.saveUserPreferences(userPreferences);

    return updatedUserPreferences;
  }
}
