import { Injectable } from '@nestjs/common';
import { CreateChannelDto, UpdateChannelDto } from './dto';
import { ChannelsRepository } from './channels.repository';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelsService {
  constructor(private channelsRepository: ChannelsRepository) {}

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    return this.channelsRepository.createChannel(createChannelDto);
  }

  findAll() {
    return `This action returns all channels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    console.log(updateChannelDto);
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
