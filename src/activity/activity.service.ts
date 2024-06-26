import { Injectable } from '@nestjs/common';
import { ActivtyRepository } from './acitivty.repository';
import { UsersRepository } from 'src/users/users.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { LogActivity } from './utils/logActivity';
import { ActivityDto } from './dto/activity.dto';
import { plainToInstance } from 'class-transformer';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    private activityRepository: ActivtyRepository,
    private userRepository: UsersRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  @OnEvent('log.created')
  handleNodeCompletedEvent(event: LogActivity) {
    this.createActivity(event);
  }

  convertToDto(activity: Activity): ActivityDto {
    const userId = activity.user.uuid;

    return plainToInstance(ActivityDto, { ...activity, userId });
  }

  async createActivity({
    userId,
    workspaceId,
    type,
    text,
  }: LogActivity): Promise<ActivityDto> {
    const user = await this.userRepository.findUserByUuid(userId);
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    const activity = await this.activityRepository.createActivityRecord({
      user,
      workspace,
      type,
      text,
    });

    return this.convertToDto(activity);
  }

  async getRecentWorkspaceActivity(
    workspaceId: string,
    page: string,
  ): Promise<ActivityDto[]> {
    const activity = await this.activityRepository.findworkspaceActivity(
      workspaceId,
      page,
    );

    return activity.map((activityEl) => this.convertToDto(activityEl));
  }

  async getUserActivity(
    userId: string,
    workspaceId: string,
    page: string,
  ): Promise<ActivityDto[]> {
    const activity = await this.activityRepository.findUserActivity(
      userId,
      workspaceId,
      page,
    );

    return activity.map((activityEl) => this.convertToDto(activityEl));
  }
}
