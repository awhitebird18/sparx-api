import { ConnectionSide } from '../enums/connectionSide.enum';

export class CreateChannelConnectorDto {
  parentChannelId: string;
  parentSide: ConnectionSide;
  childChannelId: string;
  childSide: ConnectionSide;
}
