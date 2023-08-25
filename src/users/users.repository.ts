import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';

import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  createUser(createUserDto: RegisterDto): Promise<User> {
    const user = this.create(createUserDto);
    return this.save(user);
  }

  findUserByUuid(uuid: string): Promise<User> {
    return this.findOne({ where: { uuid } });
  }

  removeUserByUuid(uuid: string): Promise<User> {
    return this.softRemove({ uuid });
  }
}
