import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SectionDto } from 'src/sections/dto';

@WebSocketGateway()
export class SectionsGateway {
  @WebSocketServer() server: Server;

  handleNewSectionSocket(section: SectionDto): void {
    this.server.emit('sections', section);
  }

  handleUpdateSectionSocket(section: SectionDto): void {
    this.server.emit('sections/update', section);
  }

  handleRemoveSectionSocket(sectionId: string): void {
    this.server.emit('sections/remove', sectionId);
  }
}
