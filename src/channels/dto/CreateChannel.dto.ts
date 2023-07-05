import { ChannelDto } from './Channel.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateChannelDto extends PartialType(ChannelDto) {}
