import { DataSource, Repository, UpdateResult } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { UserStatus } from './entities/user-status.entity';
import { CreateUserStatusDto } from './dto/create-user-status.dto';

@Injectable()
export class UserStatusesRepository extends Repository<UserStatus> {
  constructor(private dataSource: DataSource) {
    super(UserStatus, dataSource.createEntityManager());
  }

  createUserStatus(
    userId: number,
    createUserStatus: CreateUserStatusDto,
  ): Promise<UserStatus> {
    const userStatus = this.create({
      ...createUserStatus,
      user: { id: userId },
    });

    return this.save(userStatus);
  }

  findAllUserStatuses(userId: number): Promise<UserStatus[]> {
    return this.find({ where: { user: { id: userId } } });
  }

  findOneUserStatusByUuid(uuid: string): Promise<UserStatus> {
    return this.findOneByOrFail({ uuid });
  }

  removeUserStatus(uuid: string): Promise<UpdateResult> {
    return this.softDelete(uuid);
  }
}
