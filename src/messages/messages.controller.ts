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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { MessagesService } from './messages.service';

import { User } from 'src/users/entities/user.entity';

import { MessageDto } from './dto/message.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiBearerAuth('access-token')
@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @GetUser() currentUser: User,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageDto> {
    return this.messagesService.create(createMessageDto, currentUser);
  }

  @Get('channel/:channelId')
  async findChannelMessages(
    @Query('page') page: number,
    @Param('channelId') channelId: string,
  ): Promise<MessageDto[]> {
    const messages = await this.messagesService.findChannelMessages(
      channelId,
      page,
    );

    return messages;
  }

  @Get('thread/:parentMessageId')
  findThreadMessages(
    @Param('parentMessageId') parentMessageId: string,
  ): Promise<MessageDto[]> {
    return this.messagesService.findThreadMessages(parentMessageId);
  }

  @Get('user-threads')
  findUserThreads(@GetUser() user: User): Promise<any[]> {
    return this.messagesService.findUserThreads(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id/reaction')
  updateMessageReactions(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.updateMessageReactions(id, updateMessageDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
