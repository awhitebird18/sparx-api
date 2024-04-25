import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesRepository extends Repository<Workspace> {
  constructor(private dataSource: DataSource) {
    super(Workspace, dataSource.createEntityManager());
  }

  createWorkspace(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = this.create(createWorkspaceDto);

    return this.save(workspace);
  }

  findWorkspaceByUuid(uuid: string): Promise<Workspace> {
    return this.findOne({ where: { uuid } });
  }

  findUserWorkspaces(userId: number): Promise<Workspace[]> {
    return this.find({ where: { userWorkspaces: { user: { id: userId } } } });
  }

  findAllWorkspaces() {
    return this.find();
  }

  async updateWorkspace(
    uuid: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const res = await this.update({ uuid }, updateWorkspaceDto);

    if (!res.affected) {
      throw new NotFoundException(`Message with id ${uuid} not found`);
    }

    return await this.findOne({ where: { uuid } });
  }

  async removeWorkspace(uuid: string): Promise<Workspace> {
    const workspace = await this.findOne({ where: { uuid } });
    if (workspace) {
      return await this.softRemove(workspace);
    } else {
      throw new Error(`Workspace with id: ${uuid} not found`);
    }
  }
}
