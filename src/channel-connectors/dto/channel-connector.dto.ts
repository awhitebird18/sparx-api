import { ConnectionSide } from '../enums/connectionSide.enum';

export class ChannelConnectorDto {
  uuid: string;
  parentChannelId: string;
  parentSide: ConnectionSide;
  childChannelId: string;
  childSide: ConnectionSide;
}
