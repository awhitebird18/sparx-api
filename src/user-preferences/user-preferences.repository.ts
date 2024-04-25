import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPreferences } from './entities/user-preference.entity';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences';
import { CreateUserPreferences } from './dto/create-user-preferences.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPreferencessRepository extends Repository<UserPreferences> {
  constructor(private dataSource: DataSource) {
    super(UserPreferences, dataSource.createEntityManager());
  }
  async createUserPreferences(
    user: User,
    createUserPreferences?: CreateUserPreferences,
  ): Promise<UserPreferences> {
    const userPreferences = this.create(createUserPreferences);

    userPreferences.user = user;
    return this.save(userPreferences);
  }

  saveUserPreferences(
    userPreferences: UserPreferences,
  ): Promise<UserPreferences> {
    return this.save(userPreferences);
  }

  findUserPreferences(userId: number): Promise<UserPreferences> {
    return this.findOneOrFail({ where: { userId } });
  }

  async updateUserPreferences(
    userId: number,
    updateUserPreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferences> {
    const userPreference = await this.createQueryBuilder('userpreferences')
      .innerJoinAndSelect('userpreferences.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!userPreference) {
      throw new NotFoundException('User not found');
    }

    return this.save({ ...userPreference, ...updateUserPreferencesDto });
  }
}
