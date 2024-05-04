import { Injectable } from '@nestjs/common';
import { ExperienceRepository } from './experience.repository';
import { UsersRepository } from 'src/users/users.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { TaskCompletedEvent } from 'src/tasks/utils/task-completed';
import { OnEvent } from '@nestjs/event-emitter';
import { ExperienceDto } from './dto/experience.dto';
import { plainToInstance } from 'class-transformer';
import { Experience } from './entities/experience.entity';

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

  convertToDto(experience: Experience): ExperienceDto {
    return plainToInstance(ExperienceDto, experience);
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

    const experienceToSave = this.experienceRepository.create({
      user,
      workspace,
      points,
    });

    const experience = await this.experienceRepository.save(experienceToSave);
    return this.convertToDto(experience);
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

    const experienceEntries = await this.experienceRepository.find({
      where: { user: { id: user.id }, workspace: { id: workspace.id } },
    });

    return experienceEntries.map((experience) => this.convertToDto(experience));
  }
}
