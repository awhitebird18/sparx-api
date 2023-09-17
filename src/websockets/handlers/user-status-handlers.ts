import { Server } from 'socket.io';
import { WebSocketMessage } from '../utils/web-socket-message';
import { MessageType } from '../enums/ws-messagetype.enum';
import { plainToInstance } from 'class-transformer';
import { UserStatusDto } from 'src/user-statuses/dto/user-status.dto';
import { UserStatus } from 'src/user-statuses/entities/user-status.entity';

export const userStatusHandlers = {
  addUserStatus: (server: Server) => {
    return (userStatus: UserStatus, workspaceId?: string): void => {
      const websocketMessage = new WebSocketMessage(MessageType.AddUserStatus, {
        userStatus: plainToInstance(UserStatusDto, userStatus),
      });

      server
        .to(workspaceId || 'tempWorkspaceId')
        .emit('add-user-status', websocketMessage);
    };
  },

  updateUserStatus: (server: Server) => {
    return (data: { userStatus: UserStatus; userId: string }): void => {
      const websocketMessage = new WebSocketMessage(
        MessageType.UpdateUserStatus,
        {
          userStatus: plainToInstance(UserStatusDto, data.userStatus),
          userId: data.userId,
        },
      );

      server.emit('update-user-status', websocketMessage);
    };
  },

  removeUserStatus: (server: Server) => {
    return (userStatusId: string, workspaceId?: string): void => {
      const websocketMessage = new WebSocketMessage(
        MessageType.RemoveUserStatus,
        {
          userStatusId,
        },
      );

      server
        .to(workspaceId || 'tempWorkspaceId')
        .emit('remove-user-status', websocketMessage);
    };
  },
};
