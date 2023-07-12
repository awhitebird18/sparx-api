import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const User = await this.create(createUserDto);

    return await this.save(User);
  }

  async findSubscribedUsers(): Promise<User[]> {
    return this.find();
  }

  async findOneByProperties(
    searchCriteria: FindOptionsWhere<User>,
  ): Promise<User> {
    return this.findOne({ where: searchCriteria });
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
