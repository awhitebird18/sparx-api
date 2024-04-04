import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateChannelConnectorDto } from './dto/update-channel-connector.dto';
import { ChannelConnectorsRepository } from './channel-connectors.repository';
import { CreateChannelConnectorDto } from './dto/create-channel-connector.dto';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChannelConnectorsService {
  constructor(
    private channelConnectorsRepository: ChannelConnectorsRepository,
    private events: EventEmitter2,
  ) {}

  async createConnection(
    dto: CreateChannelConnectorDto,
    workspaceId: string,
  ): Promise<any> {
    const channelConnectorExists =
      await this.channelConnectorsRepository.findOne({
        where: {
          childChannel: { uuid: dto.childChannelId },
        },
      });

    const reverseExists = await this.channelConnectorsRepository.findOne({
      where: {
        childChannel: { uuid: dto.parentChannelId },
        parentChannel: { uuid: dto.childChannelId },
      },
    });

    if (channelConnectorExists) {
      await this.remove(channelConnectorExists.uuid, workspaceId);
    }
    if (reverseExists) {
      await this.remove(reverseExists.uuid, workspaceId);
    }

    const channelConnector =
      await this.channelConnectorsRepository.createConnection(dto, workspaceId);

    const channelConnectorToReturn = await this.findChannelConnector(
      channelConnector.uuid,
    );
    this.events.emit(
      'websocket-event',
      'createChannelConnector',
      channelConnectorToReturn,
      workspaceId,
    );

    return channelConnectorToReturn;
  }

  async findAll(): Promise<any[]> {
    const connectors = await this.channelConnectorsRepository.findAll();

    return connectors.map((connector) => ({
      uuid: connector.uuid,
      start: {
        nodeId: connector.parentChannel.uuid, // Assuming 'id' is the identifier
        side: connector.parentSide,
      },
      end: connector.childChannel
        ? {
            nodeId: connector.childChannel.uuid,
            side: connector.childSide,
          }
        : null,
    }));
  }

  async findWorkspaceChannelConnectors(workspaceId: string): Promise<any[]> {
    const connectors = await this.channelConnectorsRepository.find({
      where: { workspace: { uuid: workspaceId } },
      relations: ['parentChannel', 'childChannel'],
    });

    return connectors.map((connector) => ({
      uuid: connector.uuid,
      start: {
        nodeId: connector.parentChannel.uuid, // Assuming 'id' is the identifier
        side: connector.parentSide,
      },
      end: connector.childChannel
        ? {
            nodeId: connector.childChannel.uuid,
            side: connector.childSide,
          }
        : null,
    }));
  }
  async findChannelConnector(uuid: string): Promise<any> {
    const connector = await this.channelConnectorsRepository.findOne({
      where: { uuid },
      relations: ['parentChannel', 'childChannel'],
    });

    return {
      uuid: connector.uuid,
      start: {
        nodeId: connector.parentChannel.uuid, // Assuming 'id' is the identifier
        side: connector.parentSide,
      },
      end: connector.childChannel
        ? {
            nodeId: connector.childChannel.uuid,
            side: connector.childSide,
          }
        : null,
    };
  }

  update(id: string, updateChannelConnectorDto: UpdateChannelConnectorDto) {
    return `This action updates a #${id} channelConnector`;
  }

  async remove(uuid: string, workspaceId: string) {
    const connector = await this.channelConnectorsRepository.findOne({
      where: { uuid },
    });

    if (!connector) {
      throw new NotFoundException(
        `ChannelConnector with UUID ${uuid} not found`,
      );
    }

    await this.channelConnectorsRepository.softRemove(connector);

    this.events.emit(
      'websocket-event',
      'removeChannelConnector',
      connector.uuid,
      workspaceId,
    );
  }

  async removeMultiple(uuids: string[]): Promise<void> {
    try {
      // Fetch the entities based on UUIDs
      const connectors = await this.channelConnectorsRepository.find({
        where: uuids.map((uuid) => ({ uuid })),
      });

      if (connectors.length > 0) {
        // Perform soft removal
        await this.channelConnectorsRepository.softRemove(connectors);
      }
    } catch (error) {
      // Handle or throw the error
      throw new Error('Error removing channel connectors');
    }
  }
}
