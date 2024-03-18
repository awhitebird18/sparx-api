import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReviewHistoryService } from './review-history.service';
import { CreateReviewHistoryDto } from './dto/create-review-history.dto';
import { UpdateReviewHistoryDto } from './dto/update-review-history.dto';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('review-history')
export class ReviewHistoryController {
  constructor(private readonly reviewHistoryService: ReviewHistoryService) {}

  @Post()
  create(@Body() createReviewHistoryDto: CreateReviewHistoryDto) {
    return this.reviewHistoryService.create(createReviewHistoryDto);
  }

  @Get()
  findAll() {
    return this.reviewHistoryService.findAll();
  }

  @Get('today')
  findReviewedToday(@GetUser() user: User) {
    return this.reviewHistoryService.findReviewHistoryToday(user);
  }

  @Get('last-30-days')
  findReviewHistoryLast30Days(@GetUser() user: User) {
    return this.reviewHistoryService.findReviewHistoryLast30Days(user);
  }

  @Get('yearly-stats')
  getYearlyStats(@GetUser() user: User) {
    return this.reviewHistoryService.findReviewHistoryLastYear(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewHistoryDto: UpdateReviewHistoryDto,
  ) {
    return this.reviewHistoryService.update(+id, updateReviewHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewHistoryService.remove(+id);
  }
}
