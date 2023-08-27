import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { Server } from 'socket.io';

import { SectionDto } from 'src/sections/dto/section.dto';
import { Section } from 'src/sections/entities/section.entity';
import { WebSocketMessage } from './web-socket-message';
import { MessageType } from './ws-messagetype.enum';

@WebSocketGateway()
export class SectionsGateway {
  @WebSocketServer() server: Server;

  handleNewSectionSocket(section: Section): void {
    const serializedSection = plainToInstance(SectionDto, section);
    const webSocketMessage = new WebSocketMessage(MessageType.UpdateSection, {
      section: serializedSection,
    });

    this.server.emit('sections', webSocketMessage);
  }

  removeChannelFromSection({ sectionId, channelId }) {
    const webSocketMessage = new WebSocketMessage(
      MessageType.RemoveChannelFromSection,
      {
        sectionId,
        channelId,
      },
    );

    this.server.emit('sections/remove-channel', webSocketMessage);
  }

  handleUpdateSectionSocket(section: Section): void {
    const serializedSection = plainToInstance(SectionDto, section);
    const webSocketMessage = new WebSocketMessage(MessageType.UpdateSection, {
      section: serializedSection,
    });

    this.server.emit('sections/update', webSocketMessage);
  }

  handleRemoveSectionSocket(sectionId: string): void {
    const webSocketMessage = new WebSocketMessage(MessageType.RemoveSection, {
      sectionId,
    });
    this.server.emit('sections/remove', webSocketMessage);
  }
}
