import { Server } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { WebSocketMessage } from '../utils/web-socket-message';
import { MessageType } from '../enums/ws-messagetype.enum';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto';

export const userHandlers = {
  updateUser: (server: Server) => {
    return (user: User, workspaceId?: string): void => {
      const websocketMessage = new WebSocketMessage(MessageType.UpdateUser, {
        user: plainToInstance(UserDto, user),
      });

      server
        .to(workspaceId || 'tempWorkspaceId')
        .emit('update-user', websocketMessage);
    };
  },

  removeUser: (server: Server) => {
    return (userId: string, workspaceId?: string): void => {
      const websocketMessage = new WebSocketMessage(MessageType.RemoveUser, {
        userId: userId,
      });

      server
        .to(workspaceId || 'tempWorkspaceId')
        .emit('remove-user', websocketMessage);
    };
  },
};
