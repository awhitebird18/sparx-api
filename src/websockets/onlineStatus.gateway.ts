// online-status.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class OnlineStatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users = new Map<string, Date>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: any[]) {
    const userId = client.handshake.query.userId;
    console.log(userId);
    if (!userId) {
      client.disconnect();
      return;
    }

    this.users.set(userId as string, new Date());
    this.broadcastUpdatedUsers();
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    this.users.delete(userId as string);
    this.broadcastUpdatedUsers();
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(client: Socket): void {
    const userId = client.handshake.query.userId;
    this.users.set(userId as string, new Date());
    this.broadcastUpdatedUsers();
  }

  broadcastUpdatedUsers() {
    this.server.emit('online-users', Array.from(this.users.entries()));
  }
}
