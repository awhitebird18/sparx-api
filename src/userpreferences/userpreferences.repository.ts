import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Userpreferences } from './entities/userpreference.entity';
import { UpdateUserpreferenceDto } from './dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPreferencessRepository extends Repository<Userpreferences> {
  constructor(private dataSource: DataSource) {
    super(Userpreferences, dataSource.createEntityManager());
  }
  async createUserPreferences(user?: User): Promise<Userpreferences> {
    const userPreferences = this.create({});

    if (user) {
      userPreferences.user = user;
    }
    return this.save(userPreferences);
  }

  async findOneByProperties(
    searchFields: FindOptionsWhere<Userpreferences>,
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
  ): Promise<Userpreferences> {
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
