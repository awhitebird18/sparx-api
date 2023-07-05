import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './CreateMessage.dto';

export class UpdateMessageDto extends PartialType(
  OmitType(CreateMessageDto, ['channelId', 'userId'] as const),
) {}
