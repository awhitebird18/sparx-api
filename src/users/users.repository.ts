import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

import { User } from './entities/user.entity';

import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async createUser(createUserDto: RegisterDto): Promise<User> {
    const user = this.create(createUserDto);

    return await this.save(user);
  }

  async findSubscribedUsers(): Promise<User[]> {
    return this.find();
  }

  async findOneByProperties(
    searchCriteria: FindOptionsWhere<User>,
    relations?: string[],
  ): Promise<User> {
    return this.findOne({ where: searchCriteria, relations });
  }

  findUserByUuid(uuid: string): Promise<User> {
    return this.findOne({ where: { uuid } });
  }

  async updateUser(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserByUuid(uuid);

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    // Update the fields of the User
    Object.assign(user, updateUserDto);

    return this.save(user);
  }

  async removeUser(uuid: string) {
    return this.softRemove({ uuid });
  }
}
