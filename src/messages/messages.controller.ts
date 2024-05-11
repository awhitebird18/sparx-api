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
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { ThreadDto } from './dto/thread.dto';

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
  findUserThreads(@GetUser() user: User): Promise<ThreadDto[]> {
    return this.messagesService.findUserThreads(user);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string): Promise<MessageDto> {
    return this.messagesService.findOne(uuid);
  }

  @Patch(':uuid/reaction')
  updateMessageReactions(
    @Param('uuid') uuid: string,
    @Body() updateReactionDto: UpdateReactionDto,
  ): Promise<MessageDto> {
    return this.messagesService.updateMessageReactions(uuid, updateReactionDto);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDto> {
    return this.messagesService.update(uuid, updateMessageDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string): Promise<void> {
    return this.messagesService.remove(uuid);
  }
}
