import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { FlashcardReviewDTO } from './dto/card-review.dto';
import { CardDto } from './dto/card.dto';
import { ChannelCardCountDto } from './dto/channel-card-count.dto';
import { CardMaturityStatDto } from './dto/card-maturity-stat-dto';
import { CardStatDto } from './dto/card-stat.dto';
import { FlashcardIdea } from 'src/assistant/dto/flashcard-idea.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto): Promise<CardDto> {
    return this.cardService.create(createCardDto);
  }

  @Post('generate-flashcard-ideas')
  generateFlashcards(
    @Query('noteId') noteId: string,
    @Query('channelId') channelId: string,
  ): Promise<FlashcardIdea[]> {
    return this.cardService.generateFlashcardIdeas({
      noteId,
      channelId,
    });
  }

  @Post('review')
  reviewMultipleFlashcards(
    @Body() reviews: FlashcardReviewDTO[],
    @GetUser() user: User,
  ): Promise<FlashcardReviewDTO[]> {
    return this.cardService.reviewMultipleFlashcards(reviews, user);
  }

  @Get('channel/:channelId/count')
  getCardCountsDueForChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<number> {
    return this.cardService.getCardCountsDueForChannel(user, channelId);
  }

  @Get('channel/:channelId/browse')
  getCardsDueForChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<CardDto[]> {
    return this.cardService.getCardsDueForChannel(user, channelId);
  }

  @Get('channel/:channelId')
  findAllByUser(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ): Promise<CardDto[]> {
    return this.cardService.findAllByUser(user, channelId);
  }

  @Get('due-today/:workspaceId')
  getCountOfCardsDueByChannel(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ChannelCardCountDto[]> {
    return this.cardService.getCountOfCardsDueByChannel(user, workspaceId);
  }

  @Get('due-next-30-days')
  getDueFlashcardsNext30Days(@GetUser() user: User): Promise<CardStatDto[]> {
    return this.cardService.getDueFlashcardsNext30Days(user);
  }

  @Get('added-last-30-days')
  getAddedFlashcardsLast30Days(@GetUser() user: User): Promise<CardStatDto[]> {
    return this.cardService.getAddedFlashcardsLast30Days(user);
  }

  @Get('maturity-stats')
  getCardMaturityStats(@GetUser() user: User): Promise<CardMaturityStatDto[]> {
    return this.cardService.getCardMaturityStats(user);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<CardDto> {
    return this.cardService.update(uuid, updateCardDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string): Promise<{ uuid: string }> {
    return this.cardService.remove(uuid);
  }
}
