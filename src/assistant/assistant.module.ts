import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { ChannelConnectorsModule } from 'src/channel-connectors/channel-connectors.module';
import { NotesModule } from 'src/notes/notes.module';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardNoteModule } from 'src/card-note/card-note.module';

@Module({
  imports: [
    WorkspacesModule,
    ChannelsModule,
    ChannelConnectorsModule,
    NotesModule,
    CardTemplateModule,
    CardNoteModule,
  ],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
