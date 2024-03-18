import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';
import { Workspace } from './entities/workspace.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelsRepository } from 'src/channels/channels.repository';

@Injectable()
export class WorkspacesService {
  constructor(
    private workspaceRepository: WorkspacesRepository,
    private cloudinaryService: CloudinaryService,
    private channelRepository: ChannelsRepository,
    private events: EventEmitter2,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto) {
    const workspace = await this.workspaceRepository.createWorkspace(
      createWorkspaceDto,
    );

    return workspace;
  }

  findAll() {
    return this.workspaceRepository.findAllWorkspaces();
  }

  findUserWorkspaces(userId: number) {
    return this.workspaceRepository.findUserWorkspaces(userId);
  }

  findOne(id: string) {
    return this.workspaceRepository.findWorkspaceByUuid(id);
  }

  async updateWorkspace(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.updateWorkspace(
      id,
      updateWorkspaceDto,
    );

    if (updateWorkspaceDto.name) {
      await this.channelRepository.update(
        { uuid: id },
        { name: workspace.name },
      );

      // Send updated channel by socket
    }

    return workspace;
  }

  async uploadImage(workspaceId: string, imgUrl: string): Promise<Workspace> {
    // Find User
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const uploadedImageUrl = await this.cloudinaryService.upload(
      imgUrl,
      workspace.uuid,
    );

    // Update user with image path
    workspace.imgUrl = uploadedImageUrl;

    // Update User
    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    // Send updated user over socket
    // this.events.emit('websocket-event', 'updateWorkspace', updatedWorkspace);

    return updatedWorkspace;
  }

  removeWorkspace(id: string) {
    return this.workspaceRepository.removeWorkspace(id);
  }
}
