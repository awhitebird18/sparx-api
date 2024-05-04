import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { WorkspaceDto } from './dto/workspace.dto';
import { plainToInstance } from 'class-transformer';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    private workspaceRepository: WorkspacesRepository,
    private cloudinaryService: CloudinaryService,
    private channelRepository: ChannelsRepository,
  ) {}

  convertToDto(workspace: Workspace): WorkspaceDto {
    return plainToInstance(WorkspaceDto, workspace);
  }

  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.createWorkspace(
      createWorkspaceDto,
    );

    return this.convertToDto(workspace);
  }

  async findAll(): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.findAllWorkspaces();

    return workspaces.map((workspace) => this.convertToDto(workspace));
  }

  async findUserWorkspaces(userId: number): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.findUserWorkspaces(
      userId,
    );

    return workspaces.map((workspace) => this.convertToDto(workspace));
  }

  async findOne(id: string): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(id);

    return this.convertToDto(workspace);
  }

  async updateWorkspace(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.updateWorkspace(
      id,
      updateWorkspaceDto,
    );

    if (updateWorkspaceDto.name) {
      await this.channelRepository.update(
        { uuid: id },
        { name: workspace.name },
      );
    }

    return this.convertToDto(workspace);
  }

  async uploadImage(
    workspaceId: string,
    imgUrl: string,
  ): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const uploadedImageUrl = await this.cloudinaryService.upload(
      imgUrl,
      workspace.uuid,
    );

    workspace.imgUrl = uploadedImageUrl;

    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return this.convertToDto(updatedWorkspace);
  }

  async removeWorkspace(id: string): Promise<void> {
    console.log('Removing workspace 2:', id);
    return await this.workspaceRepository.removeWorkspace(id);
  }
}
