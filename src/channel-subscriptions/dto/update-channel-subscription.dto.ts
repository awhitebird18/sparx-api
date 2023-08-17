import { PartialType } from '@nestjs/mapped-types';
import { ChannelSubscriptionDto } from './channel-subscription.dto';
import { SectionDto } from 'src/sections/dto';

export class UpdateUserChannel extends PartialType(ChannelSubscriptionDto) {
  section?: SectionDto;
}
