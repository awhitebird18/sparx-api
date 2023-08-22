import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { UserPreferences } from './entities/user-preference.entity';

import { UpdateUserPreferencesDto } from './dto/update-user-preferences';
import { CreateUserPreferences } from './dto/create-user-preferences.dto';

@Injectable()
export class UserPreferencessRepository extends Repository<UserPreferences> {
  constructor(private dataSource: DataSource) {
    super(UserPreferences, dataSource.createEntityManager());
  }
  async createUserPreferences(
    createUserPreferences: CreateUserPreferences,
  ): Promise<UserPreferences> {
    const userPreferences = this.create(createUserPreferences);
    return this.save(userPreferences);
  }

  async findOneByProperties(
    searchFields: FindOptionsWhere<UserPreferences>,
    relations?: string[],
  ) {
    return await this.findOne({
      where: searchFields,
      relations,
    });
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
