import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelConnectorsService } from './channel-connectors.service';
import { CreateChannelConnectorDto } from './dto/create-channel-connector.dto';
import { UpdateChannelConnectorDto } from './dto/update-channel-connector.dto';

@Controller('channel-connectors')
export class ChannelConnectorsController {
  constructor(
    private readonly channelConnectorsService: ChannelConnectorsService,
  ) {}

  @Post(':workspaceId')
  async createConnection(
    @Body() createChannelConnectorDto: CreateChannelConnectorDto,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.channelConnectorsService.createConnection(
      createChannelConnectorDto,
      workspaceId,
    );
  }

  @Get('workspace/:workspaceId')
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.channelConnectorsService.findWorkspaceChannelConnectors(
      workspaceId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChannelConnectorDto: UpdateChannelConnectorDto,
  ) {
    return this.channelConnectorsService.update(id, updateChannelConnectorDto);
  }

  @Delete(':id/:workspaceId')
  remove(@Param('id') id: string, @Param('workspaceId') workspaceId: string) {
    return this.channelConnectorsService.remove(id, workspaceId);
  }

  @Post('bulk-delete')
  removeMultiple(@Body('ids') ids: string[]) {
    return this.channelConnectorsService.removeMultiple(ids);
  }
}
