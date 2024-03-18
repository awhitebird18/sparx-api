import { Injectable } from '@nestjs/common';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { User } from 'src/users/entities/user.entity';
import { CardTemplateRepository } from './card-template.repository';

@Injectable()
export class CardTemplateService {
  constructor(private cardTemplateRepository: CardTemplateRepository) {}
  create(createCardTemplateDto: CreateCardTemplateDto, user: User) {
    return this.cardTemplateRepository.createNote(createCardTemplateDto, user);
  }

  findAllByUser(user: User) {
    return this.cardTemplateRepository.findAllTemplatesIncludingDefault(user);
  }

  findByUuid(uuid: string) {
    return this.cardTemplateRepository.findByUuid(uuid);
  }

  updateCardTemplate(
    uuid: string,
    updateCardTemplateDto: UpdateCardTemplateDto,
  ) {
    return this.cardTemplateRepository.updateOne(uuid, updateCardTemplateDto);
  }

  removeCardTemplate(uuid: string) {
    return this.cardTemplateRepository.removeCardTemplate(uuid);
  }
}
