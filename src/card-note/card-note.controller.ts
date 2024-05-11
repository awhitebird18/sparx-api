import { Body, Controller, Post } from '@nestjs/common';
import { CardNoteService } from './card-note.service';
import { CreateCardNoteDto } from './dto/create-card-note.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CardService } from 'src/card/card.service';
import { CardDto } from 'src/card/dto/card.dto';

@Controller('card-note')
export class CardNoteController {
  constructor(
    private readonly cardNoteService: CardNoteService,
    private readonly cardService: CardService,
  ) {}

  @Post()
  create(
    @Body() createCardNoteDto: CreateCardNoteDto,
    @GetUser() user: User,
  ): Promise<CardDto[]> {
    return this.cardNoteService.create(createCardNoteDto, user);
  }
}
