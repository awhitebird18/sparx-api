import { plainToInstance } from 'class-transformer';
import { Server } from 'socket.io';
import { ChannelSubscription } from 'src/channel-subscriptions/entity/channel-subscription.entity';
import { ChannelUserCount } from 'src/channels/dto/channel-user-count.dto';
import { WebSocketMessage } from '../utils/web-socket-message';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { MessageType } from '../enums/ws-messagetype.enum';
import { Channel } from 'src/channels/entities/channel.entity';

export const channelHandlers = {
  joinChannel: (server: Server) => {
    return (channel: ChannelDto, sectionId: string, userId: string) => {
      const serializedChannel = plainToInstance(ChannelDto, channel);

      const websocketMessage = new WebSocketMessage(MessageType.JoinChannel, {
        channel: serializedChannel,
        sectionId: sectionId,
      });

      server.to(userId).emit('join-channel', websocketMessage);
    };
  },
  updateChannelUserCount: (server: Server) => {
    return (channelUserCount: ChannelUserCount, workspaceId?: string) => {
      const websocketMessage = new WebSocketMessage(MessageType.JoinChannel, {
        channelUserCount: channelUserCount,
      });

      server
        .to(workspaceId || 'tempWorkspaceId')
        .emit('update-channel-user-count', websocketMessage);
    };
  },
  updateChannel: (server: Server) => {
    return (channel: Channel, workspaceId?: string) => {
      server
        .to(workspaceId || 'tempWorkspaceId')
        .emit('update-channel', channel);
    };
  },

  leaveChannel: (server: Server) => {
    return (channelId: string, userId: string) => {
      const websocketMessage = new WebSocketMessage(MessageType.LeaveChannel, {
        channelId,
      });
      server.to(userId).emit('leave-channel', websocketMessage);
    };
  },

  // TODO: Review this
  updateChannelSubscription: (server: Server) => {
    return (channelSubscription: ChannelSubscription) => {
      server.emit('channel-subscription/update', channelSubscription);
    };
  },
};
