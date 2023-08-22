import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { UserDto } from 'src/users/dto/user.dto';

@WebSocketGateway()
export class UsersGateway {
  @WebSocketServer() server: Server;

  handleUserUpdateSocket(user: UserDto): void {
    this.server.emit('users/update', user);
  }

  handleNewUserSocket(user: UserDto): void {
    this.server.emit('users', user);
  }
}
