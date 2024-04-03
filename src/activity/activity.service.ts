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

    this.createLog(event);
  }

  async getRecentWorkspaceActivity(
    workspaceId: string,
    page: string,
  ): Promise<any> {
    const take = 10; // Number of items per page
    const currentPage = parseInt(page) || 1; // Convert page string to number, defaulting to 1 if parsing fails
    const skip = (currentPage - 1) * take; // Calculate the number of items to skip

    return this.activityRepository.find({
      where: { workspace: { uuid: workspaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: take, // Number of items to fetch
      skip: skip, // Number of items to skip
    });
  }

  async getUserActivity(
    userId: string,
    workspaceId: string,
    page: string,
  ): Promise<any> {
    const take = 10; // Number of items per page
    const currentPage = parseInt(page) || 1; // Convert page string to number, defaulting to 1 if parsing fails
    const skip = (currentPage - 1) * take; // Calculate the number of items to skip

    return this.activityRepository.find({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: take, // Number of items to fetch
      skip: skip, // Number of items to skip
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
