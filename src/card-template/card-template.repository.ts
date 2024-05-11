import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Template } from './entities/card-template.entity';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { User } from 'src/users/entities/user.entity';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';

@Injectable()
export class CardTemplateRepository extends Repository<Template> {
  constructor(
    private dataSource: DataSource,
    private workspaceRepository: WorkspacesRepository,
  ) {
    super(Template, dataSource.createEntityManager());
  }

  async createNote(
    createCardTemplateDto: CreateCardTemplateDto,
    workspaceId: string,
    user: User,
  ): Promise<Template> {
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    const message = this.create({
      ...createCardTemplateDto,
      user,
    });

    message.workspace = workspace;

    return this.save(message);
  }

  findByUuid(uuid: string): Promise<Template> {
    return this.createQueryBuilder('template')
      .where('template.uuid = :uuid', { uuid })
      .getOne();
  }

  findAllByUser(user: User, workspaceId: string): Promise<Template[]> {
    return this.createQueryBuilder('template')
      .leftJoinAndSelect('template.fields', 'fields')
      .leftJoinAndSelect('template.workspace', 'workspace')
      .where('template.userId = :uuid', { uuid: user.id })
      .andWhere('workspace.uuid = :workspaceId', { workspaceId })
      .getMany();
  }

  async findAllTemplatesIncludingDefault(
    user: User,
    workspaceId: string,
  ): Promise<Template[]> {
    return this.createQueryBuilder('template')
      .leftJoinAndSelect('template.user', 'user')
      .leftJoinAndSelect('template.workspace', 'workspace')
      .where('user.uuid = :uuid', { uuid: user.uuid })
      .andWhere('workspace.uuid = :workspaceId', { workspaceId })
      .getMany();
  }

  async updateOne(
    uuid: string,
    updateCardTemplateDto: UpdateCardTemplateDto,
  ): Promise<Template> {
    const res = await this.update({ uuid }, updateCardTemplateDto);

    if (!res.affected) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }

    return await this.findByUuid(uuid);
  }

  async removeCardTemplate(uuid: string): Promise<void> {
    const cardTemplate = await this.findByUuid(uuid);
    if (cardTemplate) {
      await this.softRemove(cardTemplate);
    } else {
      throw new Error(`Card template with UUID: ${uuid} not found`);
    }
  }
}
