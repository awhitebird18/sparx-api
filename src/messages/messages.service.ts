import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';
import { MessagesRepository } from './messages.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { plainToInstance } from 'class-transformer';
import { MessageDto } from './dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private messageRepository: MessagesRepository,
    private userRepository: UsersRepository,
    private channelRepository: ChannelsRepository,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const user = await this.userRepository.findOneByProperties({
      uuid: createMessageDto.userId,
    });

    const channel = await this.channelRepository.findOneByProperties({
      uuid: createMessageDto.channelId,
    });

    const message = await this.messageRepository.createMessage({
      ...createMessageDto,
      user,
      channel,
    });

    return plainToInstance(MessageDto, message);
  }

  findAll() {
    return this.messageRepository.find();
  }

  async findChannelMessages(
    channelId: string,
    page: number,
  ): Promise<MessageDto[]> {
    const messages = await this.messageRepository.findChannelMessages(
      channelId,
      page,
    );

    return messages.map((message: Message) =>
      plainToInstance(MessageDto, message),
    );
  }

  findOneByProperties(uuid: string) {
    return this.messageRepository.findOneByProperties({ uuid });
  }

  update(uuid: string, updateMessageDto: UpdateMessageDto) {
    return this.messageRepository.updateMessage(uuid, updateMessageDto);
  }

  remove(uuid: string) {
    return this.messageRepository.removeMessage(uuid);
  }
}
