import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardVariantService } from './card-variant.service';
import { CreateCardVariantDto } from './dto/create-card-variant.dto';
import { UpdateCardVariantDto } from './dto/update-card-variant.dto';
import { CardVariantDto } from './dto/card-variant.dto';

@Controller('card-variant')
export class CardVariantController {
  constructor(private readonly cardTypeService: CardVariantService) {}

  @Post()
  create(
    @Body() createCardVariantDto: CreateCardVariantDto,
  ): Promise<CardVariantDto> {
    return this.cardTypeService.create(createCardVariantDto);
  }

  @Get('template/:uuid')
  findByTemplate(@Param('uuid') templateId: string): Promise<CardVariantDto[]> {
    return this.cardTypeService.findByTemplate(templateId);
  }

  @Post(':cardTypeId/fields/add')
  async addField(
    @Param('cardTypeId') cardTypeId: string,
    @Body() cardFieldDto: { fieldId: string; cardSide: 'front' | 'back' },
  ): Promise<CardVariantDto> {
    return await this.cardTypeService.addField(cardTypeId, cardFieldDto);
  }

  @Post(':cardTypeId/fields/remove')
  async removeField(
    @Param('cardTypeId') cardTypeId: string,
    @Body() cardFieldDto: { fieldId: string; cardSide: 'front' | 'back' },
  ): Promise<CardVariantDto> {
    return await this.cardTypeService.removeField(cardTypeId, cardFieldDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string): Promise<CardVariantDto> {
    return this.cardTypeService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCardVariantDto: UpdateCardVariantDto,
  ): Promise<CardVariantDto> {
    return this.cardTypeService.updateOne(uuid, updateCardVariantDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string): void {
    return this.cardTypeService.removeOne(uuid);
  }
}
