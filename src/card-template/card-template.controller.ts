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

@Controller('card-template')
export class CardTemplateController {
  constructor(private readonly cardTemplateService: CardTemplateService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() createCardTemplateDto: CreateCardTemplateDto,
  ) {
    return this.cardTemplateService.create(createCardTemplateDto, user);
  }

  @Get()
  findAllByUser(@GetUser() user: User) {
    return this.cardTemplateService.findAllByUser(user);
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.cardTemplateService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCardTemplateDto: UpdateCardTemplateDto,
  ) {
    return this.cardTemplateService.updateCardTemplate(
      uuid,
      updateCardTemplateDto,
    );
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.cardTemplateService.removeCardTemplate(uuid);
  }
}
