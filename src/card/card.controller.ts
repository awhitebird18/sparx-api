import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { FlashcardReviewDTO } from './dto/card-review.dto';

@Controller('cards') // Usually, the controller path is plural
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // Create a new card
  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Post('review')
  reviewMultipleCards(
    @Body() reviews: FlashcardReviewDTO[],
    @GetUser() user: User,
  ) {
    return this.cardService.reviewMultipleFlashcards(reviews, user);
  }

  // Get a count of cards due
  @Get('channel/:channelId/count')
  getCardsDueForChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
    return this.cardService.getCardsDueForChannel(user, channelId);
  }

  // Get all cards
  @Get('channel/:channelId/browse')
  getCardsByChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
    return this.cardService.getCardsByChannel(user, channelId);
  }

  // Get all cards
  @Get('channel/:channelId')
  findAllByUser(@GetUser() user: User, @Param('channelId') channelId: string) {
    return this.cardService.findAllByUser(user, channelId);
  }

  @Get('due-today/:workspaceId')
  getDueToday(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.cardService.getCardsDueForWorkspace(user, workspaceId);
  }

  @Get('due-next-30-days')
  getDueFlashcardsNext30Days(@GetUser() user: User) {
    return this.cardService.getDueFlashcardsNext30Days(user);
  }

  @Get('added-last-30-days')
  getAddedFlashcardsLast30Days(@GetUser() user: User) {
    return this.cardService.getAddedFlashcardsLast30Days(user);
  }

  @Get('maturity-stats')
  getCardMaturityStats(@GetUser() user: User) {
    return this.cardService.getCardMaturityStats(user);
  }

  // Get a specific card by its id
  @Get(':uuid')
  findOne(@Param('id') uuid: string) {
    return this.cardService.findOne(uuid);
  }

  // Update a specific card by its uuid
  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(uuid, updateCardDto);
  }

  // Delete a specific card by its uuid
  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.cardService.remove(uuid);
  }
}
