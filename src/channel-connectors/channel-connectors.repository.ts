import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { ChannelConnector } from './entities/channel-connector.entity';
import { CreateChannelConnectorDto } from './dto/create-channel-connector.dto';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';

@Injectable()
export class ChannelConnectorsRepository extends Repository<ChannelConnector> {
  constructor(
    private dataSource: DataSource,
    private channelRepository: ChannelsRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {
    super(ChannelConnector, dataSource.createEntityManager());
  }

  async createConnection(
    dto: CreateChannelConnectorDto,
    workspaceId: string,
  ): Promise<ChannelConnector> {
    const parentChannel = await this.channelRepository.findByUuid(
      dto.parentChannelId,
    );
    const childChannel = await this.channelRepository.findByUuid(
      dto.childChannelId,
    );

    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const newConnector = this.create({
      parentChannel,
      childChannel,
      parentSide: dto.parentSide,
      childSide: dto.childSide,
      workspace,
    });

    return this.save(newConnector);
  }

  async findAll(): Promise<ChannelConnector[]> {
    return this.find({
      relations: ['parentChannel', 'childChannel'],
    });
  }
}
