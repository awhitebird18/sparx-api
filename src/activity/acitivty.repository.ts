import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from './entities/activity.entity';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Injectable()
export class ActivtyRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  createActivityRecord(createActivityDto: {
    user: User;
    workspace: Workspace;
    type: string;
    text: string;
  }): Promise<Activity> {
    const activity = this.create(createActivityDto);

    return this.save(activity);
  }

  findworkspaceActivity(
    workspaceId: string,
    page: string,
  ): Promise<Activity[]> {
    const take = 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * take;

    return this.find({
      where: { workspace: { uuid: workspaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: take,
      skip: skip,
    });
  }

  findUserActivity(
    userId: string,
    workspaceId: string,
    page: string,
  ): Promise<Activity[]> {
    const take = 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * take;

    return this.find({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: take,
      skip: skip,
    });
  }
}
