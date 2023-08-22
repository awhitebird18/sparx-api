import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChannelDto } from 'src/channels/dto/channel.dto';

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

  handleUpdateChannelSocket(channel: ChannelDto) {
    this.server.emit('channels/update', channel);
  }

  handleRemoveChannelSocket() {
    this.server.emit('channels/remove');
  }

  handleLeaveChannelSocket(channelId: string) {
    this.server.emit('ChannelSubscriptions/leave', channelId);
  }

  handleJoinChannelSocket(channelSubscription: ChannelDto) {
    this.server.emit('ChannelSubscriptions/join', channelSubscription);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, channelId: string): void {
    client.join(`${channelId}/usertyping`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, channelId: string): void {
    client.leave(`${channelId}/usertyping`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; userName: string; channelId: string },
  ): void {
    client.to(`${data.channelId}/usertyping`).emit('typing', data);
  }
}
