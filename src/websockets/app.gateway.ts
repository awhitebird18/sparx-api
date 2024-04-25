import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import handlers from './handlers';
import { UserTyping } from 'src/messages/dto/user-typing.dto';

type UserStatus = 'online' | 'away' | 'busy';
type UserData = {
  lastHeartbeat: Date;
  status: UserStatus;
};

@WebSocketGateway({ cors: process.env.CLIENT_BASE_URL })
export class AppGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() server: Server;
  handlers: any = {};
  private users = new Map<string, UserData>();

  constructor(private readonly events: EventEmitter2) {}

  onModuleInit() {
    for (const [key, handlerFunc] of Object.entries(handlers)) {
      this.handlers[key] = handlerFunc(this.server);
    }

    this.events.on('websocket-event', (eventType, ...args) => {
      const handler = this.handlers[eventType];
      if (handler) {
        handler.apply(this, args);
      } else {
        console.warn(`No handler for event type ${eventType}`);
      }
    });

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

  @SubscribeMessage('waitingForVerification')
  handleWaitingForVerification(client: Socket, payload: { userId: string }) {
    client.join(payload.userId);
  }

  @SubscribeMessage('joinWorkspace')
  handleJoinWorkspace(client: Socket, workspaceId: string) {
    client.join(workspaceId);
  }

  @SubscribeMessage('leaveWorkspace')
  handleLeaveWorkspace(client: Socket, workspaceId: string) {
    client.leave(workspaceId);
  }

  @SubscribeMessage('joinChannel')
  handleSubscribe(client: Socket, channelId: string) {
    client.join(channelId);
  }

  @SubscribeMessage('leaveChannel')
  handleUnsubscribe(client: Socket, channelId: string) {
    client.leave(channelId);
  }

  @SubscribeMessage('joinSelf')
  handleJoinSelf(client: Socket, userId: string) {
    client.join(userId);
  }

  @SubscribeMessage('leaveSelf')
  handleLeaveSelf(client: Socket, userId: string) {
    client.leave(userId);
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

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: UserTyping): void {
    client.to(data.channelId).emit('typing', data);
  }

  @SubscribeMessage('stopped-typing')
  handleStoppedTyping(
    client: Socket,
    data: { userId: string; channelId: string },
  ): void {
    this.users.delete(data.userId);
    client.to(data.channelId).emit('stopped-typing', data);
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
