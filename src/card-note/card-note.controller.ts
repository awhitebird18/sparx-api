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
  async create(
    @Body() createCardNoteDto: CreateCardNoteDto,
    @GetUser() user: User,
  ): Promise<CardDto[]> {
    const cards = await this.cardNoteService.create(createCardNoteDto, user);

    return cards.map((card) => this.cardService.convertToCardDto(card));
  }
}
