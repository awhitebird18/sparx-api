import { Injectable } from '@nestjs/common';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { User } from 'src/users/entities/user.entity';
import { CardTemplateRepository } from './card-template.repository';
import { CardTemplateDto } from './dto/card-template.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CardTemplateService {
  constructor(private cardTemplateRepository: CardTemplateRepository) {}

  async create(
    createCardTemplateDto: CreateCardTemplateDto,
    user: User,
  ): Promise<CardTemplateDto> {
    const template = await this.cardTemplateRepository.createNote(
      createCardTemplateDto,
      user,
    );

    return plainToInstance(CardTemplateDto, template);
  }

  async findAllByUser(user: User): Promise<CardTemplateDto[]> {
    const templates =
      await this.cardTemplateRepository.findAllTemplatesIncludingDefault(user);

    return templates.map((template) =>
      plainToInstance(CardTemplateDto, template),
    );
  }

  async findByUuid(uuid: string): Promise<CardTemplateDto> {
    const template = await this.cardTemplateRepository.findByUuid(uuid);

    return plainToInstance(CardTemplateDto, template);
  }

  async updateCardTemplate(
    uuid: string,
    updateCardTemplateDto: UpdateCardTemplateDto,
  ): Promise<CardTemplateDto> {
    const cardTemplate = await this.cardTemplateRepository.updateOne(
      uuid,
      updateCardTemplateDto,
    );

    return plainToInstance(CardTemplateDto, cardTemplate);
  }

  removeCardTemplate(uuid: string): void {
    this.cardTemplateRepository.removeCardTemplate(uuid);
  }
}
