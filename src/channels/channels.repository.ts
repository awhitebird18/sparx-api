import { DataSource, Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  constructor(private dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    console.log('derp', createChannelDto);
    const channel = this.create(createChannelDto);
    return this.save(channel);
  }
}
