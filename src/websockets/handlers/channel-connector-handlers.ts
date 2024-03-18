import { Server } from 'socket.io';
import { WebSocketMessage } from '../utils/web-socket-message';
import { MessageType } from '../enums/ws-messagetype.enum';
import { ChannelConnectorDto } from 'src/channel-connectors/dto/channel-connector.dto';

export const channelConnectorHandlers = {
  createChannelConnector: (server: Server) => {
    return (channelConnector: ChannelConnectorDto, workspaceId: string) => {
      const websocketMessage = new WebSocketMessage(
        MessageType.CreateChannelConnector,
        channelConnector,
      );

      server.to(workspaceId).emit('create-channel-connector', websocketMessage);
    };
  },
  removeChannelConnector: (server: Server) => {
    return (channelConnectorId: string, workspaceId: string) => {
      const websocketMessage = new WebSocketMessage(MessageType.LeaveChannel, {
        uuid: channelConnectorId,
      });

      server.to(workspaceId).emit('remove-channel-connector', websocketMessage);
    };
  },
};
