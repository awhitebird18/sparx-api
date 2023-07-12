import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserChannel } from './entity/userchannel.entity';
import { CreateUserChannelDto } from './dto/CreateUserChannel.dto';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Section } from 'src/sections/entities/section.entity';

@Injectable()
export class UserChannelsRepository extends Repository<UserChannel> {
  constructor(private dataSource: DataSource) {
    super(UserChannel, dataSource.createEntityManager());
  }

  findOneByProperties(
    searchFields: FindOptionsWhere<UserChannel>,
    relations?: string[],
  ) {
    return this.findOne({
      where: searchFields,
      relations,
    });
  }

  async updateUserChannel(userChannel): Promise<UserChannel> {
    return this.save(userChannel);
  }

  async createUserChannel(
    userChannelDto: CreateUserChannelDto,
    section: Section,
  ): Promise<UserChannel> {
    const userChannel = new UserChannel();

    userChannel.user = { uuid: userChannelDto.userId } as User;
    userChannel.channel = { uuid: userChannelDto.channelId } as Channel;
    userChannel.section = section;

    return this.save(userChannel);
  }

  async findSubscribedChannelsByUserId(
    userUuid: string,
  ): Promise<UserChannel[]> {
    return this.find({
      relations: ['user'],
      where: { user: { uuid: userUuid } },
    });
  }
}
