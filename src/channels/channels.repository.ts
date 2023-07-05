import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelsRepository extends Repository<Channel> {
  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = this.create(createChannelDto);
    return this.save(channel);
  }
}
