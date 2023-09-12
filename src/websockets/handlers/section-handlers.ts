import { SectionDto } from 'src/sections/dto/section.dto';
import { WebSocketMessage } from '../utils/web-socket-message';
import { MessageType } from '../enums/ws-messagetype.enum';
import { UpdateChannelSectionDto } from 'src/sections/dto/update-channel-section.dto';
import { Section } from 'src/sections/entities/section.entity';
import { plainToInstance } from 'class-transformer';
import { Server } from 'socket.io';

export const sectionHandlers = {
  newSection: (server: Server) => {
    return (section: SectionDto, userId: string): void => {
      const webSocketMessage = new WebSocketMessage(MessageType.UpdateSection, {
        section,
      });

      server.to(userId).emit('new-section', webSocketMessage);
    };
  },

  userSections: (server: Server) => {
    return (sections: SectionDto[], userId: string): void => {
      const webSocketMessage = new WebSocketMessage(
        MessageType.ReorderSections,
        {
          sections,
        },
      );

      server.to(userId).emit('user-sections', webSocketMessage);
    };
  },

  updateChannelSection: (server: Server) => {
    return (updateChannelSection: UpdateChannelSectionDto, userId: string) => {
      const websocketMessage = new WebSocketMessage(
        MessageType.LeaveChannel,
        updateChannelSection,
      );

      server.to(userId).emit('update-channel-section', websocketMessage);
    };
  },

  updateSection: (server: Server) => {
    return (section: Section, userId: string): void => {
      const serializedSection = plainToInstance(SectionDto, section);
      const webSocketMessage = new WebSocketMessage(MessageType.UpdateSection, {
        section: serializedSection,
      });

      server.to(userId).emit('update-section', webSocketMessage);
    };
  },

  removeSection: (server: Server) => {
    return (sectionId: string, userId: string): void => {
      const webSocketMessage = new WebSocketMessage(MessageType.RemoveSection, {
        sectionId,
      });

      server.to(userId).emit('remove-section', webSocketMessage);
    };
  },
};
