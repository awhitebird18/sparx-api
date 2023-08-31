import { ChannelType } from 'src/channels/enums/channel-type.enum';

enum AdditionalSectionType {
  ANY = 'any',
}

export const SectionType = { ...ChannelType, ...AdditionalSectionType };
