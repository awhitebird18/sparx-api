import { Injectable } from '@nestjs/common';
import { ExperienceRepository } from './experience.repository';
import { UsersRepository } from 'src/users/users.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { TaskCompletedEvent } from 'src/tasks/utils/task-completed';
import { OnEvent } from '@nestjs/event-emitter';
import { ExperienceDto } from './dto/experience.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExperienceService {
  constructor(
    private experienceRepository: ExperienceRepository,
    private userRepository: UsersRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  @OnEvent('task.completed')
  handleTaskCompletedEvent(event: TaskCompletedEvent) {
    this.addExperience(event.userId, event.workspaceId, event.points);
  }

  async addExperience(
    userId: string,
    workspaceId: string,
    points: number,
  ): Promise<ExperienceDto> {
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

    const newExperienceEntry = await this.experienceRepository.save(experience);
    return plainToInstance(ExperienceDto, newExperienceEntry);
  }

  async getUsersExperienceByWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<ExperienceDto[]> {
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

    const experience = await this.experienceRepository.find({
      where: { user: { id: user.id }, workspace: { id: workspace.id } },
    });

    return plainToInstance(ExperienceDto, experience);
  }
}
