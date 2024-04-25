import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { WorkspaceDto } from './dto/workspace.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WorkspacesService {
  constructor(
    private workspaceRepository: WorkspacesRepository,
    private cloudinaryService: CloudinaryService,
    private channelRepository: ChannelsRepository,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.createWorkspace(
      createWorkspaceDto,
    );

    return plainToInstance(WorkspaceDto, workspace);
  }

  async findAll(): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.findAllWorkspaces();

    return workspaces.map((workspace) =>
      plainToInstance(WorkspaceDto, workspace),
    );
  }

  async findUserWorkspaces(userId: number): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.findUserWorkspaces(
      userId,
    );

    return workspaces.map((workspace) =>
      plainToInstance(WorkspaceDto, workspace),
    );
  }

  async findOne(id: string): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(id);

    return plainToInstance(WorkspaceDto, workspace);
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

    return plainToInstance(WorkspaceDto, workspace);
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

    return plainToInstance(WorkspaceDto, updatedWorkspace);
  }

  removeWorkspace(id: string): void {
    this.workspaceRepository.removeWorkspace(id);
  }
}
