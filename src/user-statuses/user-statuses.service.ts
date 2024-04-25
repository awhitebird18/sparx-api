import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserStatusDto } from './dto/create-user-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserStatusesRepository } from './user-statuses.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserStatus } from './entities/user-status.entity';
import { User } from 'src/users/entities/user.entity';
import { UserStatusDto } from './dto/user-status.dto';

@Injectable()
export class UserStatusesService {
  constructor(
    private userStatusesRepository: UserStatusesRepository,
    private events: EventEmitter2,
  ) {}

  async createUserStatus(
    user: User,
    createUserStatusDto: CreateUserStatusDto,
  ): Promise<UserStatusDto> {
    const userStatus = await this.userStatusesRepository.createUserStatus(
      user.id,
      createUserStatusDto,
    );
    this.events.emit('websocket-event', 'updateUserStatus', {
      userStatus,
      userId: user.uuid,
    });

    return userStatus;
  }

  findAllUserStatuses(userId: number): Promise<UserStatus[]> {
    return this.userStatusesRepository.findAllUserStatuses(userId);
  }

  async updateUserStatus(
    userStatusUuid: string,
    updateUserStatusDto: UpdateUserStatusDto,
    userId: string,
  ): Promise<UserStatusDto> {
    const userStatusFound =
      await this.userStatusesRepository.findOneUserStatusByUuid(userStatusUuid);

    Object.assign(userStatusFound, updateUserStatusDto);

    const updatedUserStatus = await this.userStatusesRepository.save(
      userStatusFound,
    );

    this.events.emit('websocket-event', 'updateUserStatus', {
      userStatus: updatedUserStatus,
      userId,
    });

    return updatedUserStatus;
  }

  async removeUserStatus(uuid: string, user: User): Promise<void> {
    const updateResult = await this.userStatusesRepository.softDelete({ uuid });

    if (updateResult.affected === 0)
      throw new NotFoundException('Unable to remove user status');

    this.events.emit('websocket-event', 'updateUserStatus', {
      userStatus: {},
      userId: user.uuid,
    });
  }
}
