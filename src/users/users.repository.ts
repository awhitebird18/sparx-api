import { DataSource, DeleteResult, Repository } from 'typeorm';
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

  findWorkspaceUsers(workspaceId: string): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.customStatuses',
        'customStatus',
        'customStatus.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect('user.preferences', 'preferences')
      .leftJoinAndSelect('user.userWorkspaces', 'userWorkspaces')
      .leftJoinAndSelect('userWorkspaces.workspace', 'workspace')
      .where('workspace.uuid = :workspaceId', { workspaceId })
      .getMany();
  }

  removeUserByUuid(uuid: string): Promise<DeleteResult> {
    return this.delete({ uuid });
  }
}
