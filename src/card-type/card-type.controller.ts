import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardTypeService } from './card-type.service';
import { CreateCardTypeDto } from './dto/create-card-type.dto';
import { UpdateCardTypeDto } from './dto/update-card-type.dto';

@Controller('card-type')
export class CardTypeController {
  constructor(private readonly cardTypeService: CardTypeService) {}

  @Post()
  create(@Body() createCardTypeDto: CreateCardTypeDto) {
    return this.cardTypeService.create(createCardTypeDto);
  }

  @Get('template/:uuid')
  findByTemplate(@Param('uuid') templateId: string) {
    return this.cardTypeService.findByTemplate(templateId);
  }

  @Post(':cardTypeId/fields/add')
  async addField(
    @Param('cardTypeId') cardTypeId: string,
    @Body() cardFieldDto: { fieldId: string; cardSide: 'front' | 'back' },
  ) {
    return await this.cardTypeService.addField(cardTypeId, cardFieldDto);
  }

  @Post(':cardTypeId/fields/remove')
  async removeField(
    @Param('cardTypeId') cardTypeId: string,
    @Body() cardFieldDto: { fieldId: string; cardSide: 'front' | 'back' },
  ) {
    return await this.cardTypeService.removeField(cardTypeId, cardFieldDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.cardTypeService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCardTypeDto: UpdateCardTypeDto,
  ) {
    return this.cardTypeService.updateOne(uuid, updateCardTypeDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.cardTypeService.removeOne(uuid);
  }
}
