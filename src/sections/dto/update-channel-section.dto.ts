import { IsUUID } from 'class-validator';

export class UpdateChannelSectionDto {
  @IsUUID('4')
  sectionId: string;

  @IsUUID('4')
  channelId: string;
}
