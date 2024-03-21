import { Injectable } from '@nestjs/common';
import { ActivtyRepository } from './acitivty.repository';
import { UsersRepository } from 'src/users/users.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { LogActivity } from './utils/logActivity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ActivityService {
  constructor(
    private activityRepository: ActivtyRepository,
    private userRepository: UsersRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  @OnEvent('log.created')
  handleNodeCompletedEvent(event: LogActivity) {
    // Logic to handle the completed node event, e.g., logging to database
    console.log('Log Received!', event);

    this.createLog(event);
  }

  async getRecentWorkspaceActivity(workspaceId: string): Promise<any> {
    return this.activityRepository.find({
      where: { workspace: { uuid: workspaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivity(userId: string, workspaceId: string): Promise<any> {
    return this.activityRepository.find({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async createLog({ userId, workspaceId, type, text }: LogActivity) {
    const user = await this.userRepository.findUserByUuid(userId);
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    const activity = this.activityRepository.create({
      user,
      workspace,
      type,
      text,
    });

    await this.activityRepository.save(activity);
  }
}
