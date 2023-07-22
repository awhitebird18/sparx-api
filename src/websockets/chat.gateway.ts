import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageDto } from 'src/messages/dto';
import { SectionDto } from 'src/sections/dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection() {
    console.log('connected');
  }

  async handleDisconnect() {
    console.log('disconnected');
  }

  // This is a message handler for 'chatToServer' events
  handleSendMessageSocket(message: MessageDto) {
    console.log(message);
    this.server.emit(`messages/${message.channelId}`, message);
  }

  // This is a message handler for 'chatToServer' events
  handleNewSectionSocket(section: SectionDto) {
    this.server.emit('sections', section);
  }
}
