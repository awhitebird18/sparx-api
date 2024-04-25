import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardFieldService } from './card-field.service';
import { CreateCardFieldDto } from './dto/create-card-field.dto';
import { UpdateCardFieldDto } from './dto/update-card-field.dto';
import { CardFieldDto } from './dto/card-field.dto';

@Controller('card-field')
export class CardFieldController {
  constructor(private readonly cardFieldService: CardFieldService) {}

  @Post()
  create(
    @Body() createCardFieldDto: CreateCardFieldDto,
  ): Promise<CardFieldDto> {
    return this.cardFieldService.create(createCardFieldDto);
  }

  @Get('template/:uuid')
  findByTemplate(@Param('uuid') templateId: string): Promise<CardFieldDto[]> {
    return this.cardFieldService.findByTemplate(templateId);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string): Promise<CardFieldDto> {
    return this.cardFieldService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCardFieldDto: UpdateCardFieldDto,
  ): Promise<CardFieldDto> {
    return this.cardFieldService.updateOne(uuid, updateCardFieldDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string): void {
    return this.cardFieldService.removeOne(uuid);
  }
}
