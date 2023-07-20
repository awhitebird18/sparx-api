import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Channel } from 'src/channels/entities/channel.entity';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173' },
})
export class ChannelGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private clients = new Map<string, any>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    // Generate an ID for the client and save the reference
    const clientId = 'Some ID';
    client.clientId = clientId;
    this.clients.set(clientId, client);
  }

  handleDisconnect(client: any) {
    // Remove the client when disconnected
    this.clients.delete(client.clientId);
  }

  sendChannelUpdate() {
    this.server.emit('channelUpdate');
  }

  @SubscribeMessage('signal')
  handleSignal({
    senderId,
    recipientId,
    signal,
  }: {
    senderId: string;
    recipientId: string;
    signal: any;
  }) {
    const recipientSocket = this.clients.get(recipientId);
    if (!recipientSocket) {
      return;
    }
    recipientSocket.emit('signal', {
      signal,
      senderId: senderId,
    });
  }

  private transformChannelData(channel: Channel) {
    return channel;
  }
}
