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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessageDto } from './dto';

@ApiBearerAuth('access-token')
@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto): Promise<MessageDto> {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOneByProperties(id);
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
