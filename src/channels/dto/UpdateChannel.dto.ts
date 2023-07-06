import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './CreateChannel.dto';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {}
