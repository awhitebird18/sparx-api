import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';

import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async createUser(createUserDto: RegisterDto): Promise<User> {
    const user = this.create(createUserDto);
    return await this.save(user);
  }

  async findUserByUuid(uuid: string): Promise<User> {
    return await this.findOne({ where: { uuid } });
  }

  async removeUser(uuid: string) {
    return this.softRemove({ uuid });
  }
}
