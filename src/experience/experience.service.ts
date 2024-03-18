import { Injectable } from '@nestjs/common';
import { ExperienceRepository } from './experience.repository';
import { Experience } from './entities/experience.entity';
import { UsersRepository } from 'src/users/users.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { TaskCompletedEvent } from 'src/tasks/task-completed';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ExperienceService {
  constructor(
    private experienceRepository: ExperienceRepository,
    private userRepository: UsersRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  @OnEvent('task.completed')
  handleTaskCompletedEvent(event: TaskCompletedEvent) {
    // Call the method to add experience points
    this.addExperience(event.userId, event.workspaceId, event.points);
  }

  // May be best to create separate class for this
  async addExperience(
    userId: string,
    workspaceId: string,
    points: number,
  ): Promise<Experience> {
    const user = await this.userRepository.findUserByUuid(userId);

    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    if (!user) {
      throw new Error('User not found');
    }
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const experience = this.experienceRepository.create({
      user,
      workspace,
      points,
      date: new Date(),
    });

    await this.experienceRepository.save(experience);
    return experience;
  }

  async getUsersExperienceByWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<Experience[]> {
    const user = await this.userRepository.findUserByUuid(userId);

    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    if (!user) {
      throw new Error('User not found');
    }
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return this.experienceRepository.find({
      where: { user: { id: user.id }, workspace: { id: workspace.id } },
    });
  }
}
