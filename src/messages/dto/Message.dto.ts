import { BaseDto } from 'src/common/dto/Base.dto';
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './CreateMessage.dto';
import { ChannelDto } from 'src/channels/dto';
import { UserDto } from 'src/users/dto';
import { ReactionDto } from '../dto/Reaction.dto';

export class MessageDto extends IntersectionType(CreateMessageDto, BaseDto) {
  channel: ChannelDto;

  user: UserDto;

  channelId: string;

  userId: string;

  uuid: string;

  reactions: Partial<ReactionDto>[];

  childrenMessages?: MessageDto[];
}
