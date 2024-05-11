import { Injectable } from '@nestjs/common';
import { UserPreferencessRepository } from './user-preferences.repository';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences';
import { CreateUserPreferences } from './dto/create-user-preferences.dto';
import { UserPreferencesDto } from './dto/user-preferences.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPreferencesService {
  constructor(private userPreferencesRepository: UserPreferencessRepository) {}

  createUserPreferences(
    user: User,
    createUserPreferences?: CreateUserPreferences,
  ): Promise<UserPreferencesDto> {
    return this.userPreferencesRepository.createUserPreferences(
      user,
      createUserPreferences,
    );
  }

  findUserPreferences(userId: number): Promise<UserPreferencesDto> {
    return this.userPreferencesRepository.findOne({
      where: { userId },
    });
  }

  async update(
    userId: number,
    updateUserpreferenceDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    const userPreferences =
      await this.userPreferencesRepository.findUserPreferences(userId);

    Object.assign(userPreferences, updateUserpreferenceDto);

    const updatedUserPreferences =
      this.userPreferencesRepository.saveUserPreferences(userPreferences);

    return updatedUserPreferences;
  }
}
