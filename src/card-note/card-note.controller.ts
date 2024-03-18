import { Body, Controller, Post } from '@nestjs/common';
import { CardNoteService } from './card-note.service';
import { CreateCardNoteDto } from './dto/create-card-note.dto'; // Ensure you define this DTO
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('card-note')
export class CardNoteController {
  constructor(private readonly cardNoteService: CardNoteService) {}

  @Post()
  create(@Body() createCardNoteDto: CreateCardNoteDto, @GetUser() user: User) {
    return this.cardNoteService.create(createCardNoteDto, user);
  }
}
