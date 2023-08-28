import { OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type UserStatus = 'online' | 'away' | 'busy';
type UserData = {
  lastHeartbeat: Date;
  status: UserStatus;
};

@WebSocketGateway()
export class OnlineStatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private users = new Map<string, UserData>();

  onModuleInit() {
    this.initCleanupRoutine();
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (!userId) {
      client.disconnect();
      return;
    }
    this.users.set(userId as string, {
      lastHeartbeat: new Date(),
      status: 'online',
    });
    this.broadcastUpdatedUsers();
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    this.users.delete(userId as string);
    this.broadcastUpdatedUsers();
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(client: Socket, data: { status: UserStatus }): void {
    const userId = client.handshake.query.userId;
    this.users.set(userId as string, {
      lastHeartbeat: new Date(),
      status: data.status,
    });
    this.broadcastUpdatedUsers();
  }

  @SubscribeMessage('change-status')
  handleChangeStatus(client: Socket, data: { status: UserStatus }): void {
    const userId = client.handshake.query.userId;
    const user = this.users.get(userId as string);
    if (user) {
      user.status = data.status;
      this.broadcastUpdatedUsers();
    }
  }

  initCleanupRoutine() {
    setInterval(() => {
      const now = new Date();
      for (const [userId, userData] of this.users.entries()) {
        if (now.getTime() - userData.lastHeartbeat.getTime() > 20000) {
          this.users.delete(userId);
          this.broadcastUpdatedUsers();
        }
      }
    }, 10000);
  }

  broadcastUpdatedUsers() {
    const userIdsAndStatus = Array.from(this.users.entries()).map(
      ([userId, data]) => ({
        userId,
        status: data.status,
      }),
    );

    this.server.emit('online-users', userIdsAndStatus);
  }
}
