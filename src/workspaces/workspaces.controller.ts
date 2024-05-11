import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceDto } from './dto/workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspacesService.create(createWorkspaceDto);
  }

  @Get()
  findAll(): Promise<any> {
    return this.workspacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.workspacesService.findOne(id);
  }

  @Patch(':workspaceId/image-upload')
  updateProfileImage(
    @Body() data: { imgUrl: string },
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceDto> {
    return this.workspacesService.uploadImage(workspaceId, data.imgUrl);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspacesService.updateWorkspace(id, updateWorkspaceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.workspacesService.removeWorkspace(id);
  }
}
