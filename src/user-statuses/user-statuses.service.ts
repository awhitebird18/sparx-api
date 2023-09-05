import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserStatusDto } from './dto/create-user-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserStatusesRepository } from './user-statuses.repository';
import { UserStatusDto } from './dto/user-status.dto';

@Injectable()
export class UserStatusesService {
  constructor(private userStatusesRepository: UserStatusesRepository) {}

  createUserStatus(
    userId: number,
    createUserStatusDto: CreateUserStatusDto,
  ): Promise<UserStatusDto> {
    return this.userStatusesRepository.createUserStatus(
      userId,
      createUserStatusDto,
    );
  }

  findAllUserStatuses(userId: number): Promise<UserStatusDto[]> {
    return this.userStatusesRepository.findAllUserStatuses(userId);
  }

  async updateUserStatus(
    userStatusUuid: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserStatusDto> {
    // Find existing userStatus
    const userStatusFound =
      await this.userStatusesRepository.findOneUserStatusByUuid(userStatusUuid);

    // Update userStatus
    Object.assign(userStatusFound, updateUserStatusDto);

    return await this.userStatusesRepository.save(userStatusFound);
  }

  async removeUserStatus(uuid: string): Promise<void> {
    const updateResult = await this.userStatusesRepository.softDelete({ uuid });

    if (updateResult.affected === 0)
      throw new NotFoundException('Unable to remove user status');
  }
}
