import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { UserPreferences } from './entities/user-preference.entity';
import { UpdateUserpreferenceDto } from './dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPreferencessRepository extends Repository<UserPreferences> {
  constructor(private dataSource: DataSource) {
    super(UserPreferences, dataSource.createEntityManager());
  }
  async createUserPreferences(user?: User): Promise<UserPreferences> {
    const userPreferences = this.create({});

    if (user) {
      userPreferences.user = user;
    }
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
    userId: string,
    updateUserPreferencesDto: UpdateUserpreferenceDto,
  ): Promise<UserPreferences> {
    const userPreference = await this.createQueryBuilder('userpreferences')
      .innerJoinAndSelect('userpreferences.user', 'user')
      .where('user.uuid = :userId', { userId })
      .getOne();

    if (!userPreference) {
      throw new NotFoundException(`Preferences for user ${userId} not found`);
    }

    return this.save({ ...userPreference, ...updateUserPreferencesDto });
  }
}
