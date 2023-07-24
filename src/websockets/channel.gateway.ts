import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChannelDto, UpdateChannelDto } from 'src/channels/dto';
import { UserChannelDto } from 'src/userchannels/dto/UserChannel.dto';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173' },
})
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private clients = new Map<string, any>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    const clientId = 'Some ID';
    client.clientId = clientId;
    this.clients.set(clientId, client);
  }

  handleDisconnect(client: any) {
    this.clients.delete(client.clientId);
  }

  handleNewChannelSocket(channel: ChannelDto) {
    this.server.emit('channels', channel);
  }

  handleUpdateChannelSocket(channel: UpdateChannelDto) {
    this.server.emit('channels/update', channel);
  }

  handleRemoveChannelSocket() {
    this.server.emit('channels/remove');
  }

  handleLeaveChannelSocket(channelId: string) {
    this.server.emit('userchannels/leave', channelId);
  }

  handleJoinChannelSocket(userChannel: UserChannelDto) {
    this.server.emit('userchannels/join', userChannel);
  }
}
