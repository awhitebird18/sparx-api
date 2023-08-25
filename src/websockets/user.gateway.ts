import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WebSocketMessage } from './web-socket-message';
import { User } from 'src/users/entities/user.entity';
import { MessageType } from './ws-messagetype.enum';

@WebSocketGateway()
export class UsersGateway {
  @WebSocketServer() server: Server;

  handleUpdateUserSocket(user: User): void {
    const websocketMessage = new WebSocketMessage(MessageType.RemoveUser, {
      user,
    });

    this.server.emit('users/update', websocketMessage);
  }

  handleRemoveUserSocket(userId: string): void {
    const websocketMessage = new WebSocketMessage(MessageType.RemoveUser, {
      userId: userId,
    });

    this.server.emit('users/remove', websocketMessage);
  }
}
