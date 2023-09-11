import { Server } from 'socket.io';
import { MessageDto } from 'src/messages/dto/message.dto';
import { WebSocketMessage } from '../utils/web-socket-message';
import { MessageType } from '../enums/ws-messagetype.enum';

export const messageHandlers = {
  newMessage: (server: Server) => {
    return (message: MessageDto) => {
      const webSocketMessage = new WebSocketMessage(MessageType.UpdateMessage, {
        message,
      });

      server.to(message.channelId).emit('new-message', webSocketMessage);
    };
  },

  updateMessage: (server: Server) => {
    return (message: MessageDto) => {
      const webSocketMessage = new WebSocketMessage(MessageType.UpdateMessage, {
        message,
      });

      server.to(message.channelId).emit('update-message', webSocketMessage);
    };
  },

  removeMessage: (server: Server) => {
    return (channelId: string, messageId: string) => {
      const webSocketMessage = new WebSocketMessage(MessageType.RemoveMessage, {
        messageId,
        channelId,
      });

      server.to(channelId).emit('remove-message', webSocketMessage);
    };
  },
};
