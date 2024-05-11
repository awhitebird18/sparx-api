import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardTemplateService } from './card-template.service';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CardTemplateDto } from './dto/card-template.dto';

@Controller('card-template')
export class CardTemplateController {
  constructor(private readonly cardTemplateService: CardTemplateService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body()
    body: { card: CreateCardTemplateDto; workspaceId: string },
  ): Promise<CardTemplateDto> {
    return this.cardTemplateService.create(body.card, body.workspaceId, user);
  }

  @Get('user/:workspaceId')
  findAllByUser(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<CardTemplateDto[]> {
    return this.cardTemplateService.findAllByUser(user, workspaceId);
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string): Promise<CardTemplateDto> {
    return this.cardTemplateService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCardTemplateDto: UpdateCardTemplateDto,
  ): Promise<CardTemplateDto> {
    return this.cardTemplateService.updateCardTemplate(
      uuid,
      updateCardTemplateDto,
    );
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string): void {
    return this.cardTemplateService.removeCardTemplate(uuid);
  }
}
