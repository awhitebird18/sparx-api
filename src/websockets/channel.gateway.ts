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
import { plainToInstance } from 'class-transformer';
import { ChannelUserCount } from 'src/channels/dto/channel-user-count.dto';
import { UpdateChannelSectionDto } from 'src/sections/dto/update-channel-section.dto';

@WebSocketGateway({
  cors: { origin: process.env.CLIENT_BASE_URL },
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

  // Channel Sockets
  joinChannel(channel: ChannelDto, sectionId: string) {
    const serializedChannel = plainToInstance(ChannelDto, channel);
    const websocketMessage = new WebSocketMessage(MessageType.JoinChannel, {
      channel: serializedChannel,
      sectionId: sectionId,
    });
    this.server.emit('join-channel', websocketMessage);
  }

  updateChannelCount(channelUserCount: ChannelUserCount) {
    const websocketMessage = new WebSocketMessage(MessageType.JoinChannel, {
      channelUserCount: channelUserCount,
    });
    this.server.emit('update-channel-count', websocketMessage);
  }

  handleUpdateChannelSocket(channel: Channel) {
    this.server.emit('channels/update', channel);
  }

  leaveChannel(channelId: string) {
    const websocketMessage = new WebSocketMessage(MessageType.LeaveChannel, {
      channelId,
    });

    this.server.emit('leave-channel', websocketMessage);
  }

  updateChannelSection(updateChannelSection: UpdateChannelSectionDto) {
    const websocketMessage = new WebSocketMessage(
      MessageType.LeaveChannel,
      updateChannelSection,
    );

    this.server.emit('update-channel-section', websocketMessage);
  }

  // Channel Subscriptions
  handleUpdateChannelSubscriptionSocket(
    channelSubscription: ChannelSubscription,
  ) {
    this.server.emit('channel-subscription/update', channelSubscription);
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
