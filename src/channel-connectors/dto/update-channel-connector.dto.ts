import { PartialType } from '@nestjs/swagger';
import { CreateChannelConnectorDto } from './create-channel-connector.dto';

export class UpdateChannelConnectorDto extends PartialType(
  CreateChannelConnectorDto,
) {}
