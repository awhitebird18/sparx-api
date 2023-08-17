import { BaseDto } from 'src/common/dto/base.dto';
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { ChannelDto } from 'src/channels/dto';
import { UserDto } from 'src/users/dto';
import { ReactionDto } from './reaction.dto';
import { Message } from '../entities/message.entity';

export class MessageDto extends IntersectionType(CreateMessageDto, BaseDto) {
  channel: ChannelDto;

  user: UserDto;

  channelId: string;

  userId: string;

  uuid: string;

  reactions: Partial<ReactionDto>[];

  childMessages?: Message[];
}
