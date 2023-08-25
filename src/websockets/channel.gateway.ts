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
import { WebSocketMessage } from './web-socket-message';
import { MessageType } from './ws-messagetype.enum';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { Channel } from 'src/channels/entities/channel.entity';

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

  handleUpdateChannelSocket(channel: Channel) {
    this.server.emit('channels/update', channel);
  }

  handleUpdateChannelSubscriptionSocket(
    channelSubscription: ChannelSubscription,
  ) {
    this.server.emit('channel-subscription/update', channelSubscription);
  }

  handleRemoveChannelSocket(channelId: string) {
    const websocketMessage = new WebSocketMessage(MessageType.RemoveChannel, {
      channelId,
    });

    this.server.emit('channels/remove', websocketMessage);
  }

  handleLeaveChannelSocket(channelId: string) {
    this.server.emit('ChannelSubscriptions/leave', channelId);
  }

  handleJoinChannelSocket(channelSubscription: unknown) {
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
