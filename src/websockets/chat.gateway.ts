import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from 'src/messages/dto';
import { SectionDto } from 'src/sections/dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection() {
    console.info('connected');
  }

  async handleDisconnect() {
    console.info('disconnected');
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, channelId: string) {
    client.join(channelId);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, channelId: string) {
    client.leave(channelId);
  }

  // This is a message handler for 'chatToServer' events
  handleSendMessageSocket(message: MessageDto) {
    this.server.to(message.channelId).emit('new message', message);
  }

  // This is a message handler for 'chatToServer' events
  handleUpdateMessageSocket(message: MessageDto) {
    this.server.emit(`messages/${message.channelId}/update`, message);
  }

  // This is a message handler for 'chatToServer' events
  handleRemoveMessageSocket(channelId: string, messageId: string) {
    this.server.emit(`messages/${channelId}/remove`, messageId);
  }

  // This is a message handler for 'chatToServer' events
  handleNewSectionSocket(section: SectionDto) {
    this.server.emit('sections', section);
  }
}
