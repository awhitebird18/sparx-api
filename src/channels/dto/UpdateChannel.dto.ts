import { PartialType } from '@nestjs/mapped-types';
import { ChannelDto } from './Channel.dto';

export class UpdateChannelDto extends PartialType(ChannelDto) {}
