import { Injectable } from '@nestjs/common';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { User } from 'src/users/entities/user.entity';
import { CardTemplateRepository } from './card-template.repository';
import { CardTemplateDto } from './dto/card-template.dto';
import { plainToInstance } from 'class-transformer';
import { Template } from './entities/card-template.entity';

@Injectable()
export class CardTemplateService {
  constructor(private cardTemplateRepository: CardTemplateRepository) {}

  convertToDto(template: Template): CardTemplateDto {
    return plainToInstance(CardTemplateDto, template);
  }

  async create(
    createCardTemplateDto: CreateCardTemplateDto,
    workspaceId: string,
    user: User,
  ): Promise<CardTemplateDto> {
    const template = await this.cardTemplateRepository.createNote(
      createCardTemplateDto,
      workspaceId,
      user,
    );

    return this.convertToDto(template);
  }

  async findAllByUser(
    user: User,
    workspaceId: string,
  ): Promise<CardTemplateDto[]> {
    const templates =
      await this.cardTemplateRepository.findAllTemplatesIncludingDefault(
        user,
        workspaceId,
      );

    return templates.map((template) => this.convertToDto(template));
  }

  async findByUuid(uuid: string): Promise<CardTemplateDto> {
    const template = await this.cardTemplateRepository.findByUuid(uuid);

    return this.convertToDto(template);
  }

  async updateCardTemplate(
    uuid: string,
    updateCardTemplateDto: UpdateCardTemplateDto,
  ): Promise<CardTemplateDto> {
    const template = await this.cardTemplateRepository.updateOne(
      uuid,
      updateCardTemplateDto,
    );

    return this.convertToDto(template);
  }

  removeCardTemplate(uuid: string): void {
    this.cardTemplateRepository.removeCardTemplate(uuid);
  }
}
