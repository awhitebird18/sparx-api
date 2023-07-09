import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/channels/entities/channel.entity';

@WebSocketGateway()
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // This will be called when a client connects to the socket
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // This will be called when a client disconnects
    console.log(`Client disconnected: ${client.id}`);
  }

  sendChannelUpdate() {
    // Send the data to all connected clients
    this.server.emit('channelUpdate');
  }

  private transformChannelData(channel: Channel) {
    // Transform your channel data here...
    return channel;
  }
}
