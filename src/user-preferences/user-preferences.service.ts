import { Injectable } from '@nestjs/common';

import { UserPreferencessRepository } from './user-preferences.repository';

import { UpdateUserPreferencesDto } from './dto/update-user-preferences';
import { CreateUserPreferences } from './dto/create-user-preferences.dto';

@Injectable()
export class UserPreferencesService {
  constructor(private userPreferencesRepository: UserPreferencessRepository) {}

  async createUserPreferences(createUserPreferences: CreateUserPreferences) {
    return await this.userPreferencesRepository.createUserPreferences(
      createUserPreferences,
    );
  }

  async findUserPreferences(userId: number) {
    return await this.userPreferencesRepository.findOne({
      where: { userId },
    });
  }

  async update(
    userId: number,
    updateUserpreferenceDto: UpdateUserPreferencesDto,
  ) {
    await this.userPreferencesRepository.updateUserPreferences(
      userId,
      updateUserpreferenceDto,
    );

    // Todo: need to pass in user id
    return await this.findUserPreferences(1);
  }
}
