import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { UpdateChannelDto } from './dto/UpdateChannel.dto';

@Injectable()
export class ChannelsService {
  create(createChannelDto: CreateChannelDto) {
    return 'This action adds a new channel';
  }

  findAll() {
    return `This action returns all channels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
