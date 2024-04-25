import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserWorkspaceDto } from './dto/update-user-workspace.dto';
import { UserWorkspacesRepository } from './user-workspace.repository';
import { User } from 'src/users/entities/user.entity';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { InviteUserDto } from 'src/users/dto/invite-user.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersRepository } from 'src/users/users.repository';
import { UserWorkspace } from './entities/user-workspace.entity';
import { UserWorkspaceDto } from './dto/user-workspace.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserWorkspacesService {
  constructor(
    private userWorkspaceRepository: UserWorkspacesRepository,
    private workspaceRepository: WorkspacesRepository,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private userRepository: UsersRepository,
  ) {}

  private convertToUserWorkspaceDto(
    userWorkspace: UserWorkspace,
  ): UserWorkspaceDto {
    const workspaceId = userWorkspace.workspace.uuid;

    return plainToInstance(UserWorkspaceDto, {
      bio: userWorkspace.bio,
      goal: userWorkspace.goal,
      isAdmin: userWorkspace.isAdmin,
      isFirstLogin: userWorkspace.isFirstLogin,
      lastViewed: userWorkspace.lastViewed,
      location: userWorkspace.location,
      streakCount: userWorkspace.streakCount,
      website: userWorkspace.website,
      workspaceId: workspaceId,
    });
  }

  async joinWorkspace(
    user: User,
    workspaceId: string,
  ): Promise<UserWorkspaceDto> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const workspaceUsers = await this.userWorkspaceRepository.find({
      where: { workspace: { id: workspace.id } },
      relations: ['workspace'],
    });

    const isAdmin = workspaceUsers.length === 0;

    const userWorkspaceRecord =
      await this.userWorkspaceRepository.joinWorkspace(
        user,
        workspace,
        isAdmin,
      );

    const userWorkspaceDto =
      this.convertToUserWorkspaceDto(userWorkspaceRecord);

    return userWorkspaceDto;
  }

  async findUserWorkspaces(userId: string): Promise<UserWorkspaceDto[]> {
    const userWorkspaces = await this.userWorkspaceRepository
      .createQueryBuilder('userWorkspace')
      .leftJoinAndSelect('userWorkspace.workspace', 'workspace')
      .leftJoin('userWorkspace.user', 'user')
      .addSelect(['workspace.uuid']) // Alias the selected column
      .where('user.uuid = :userId', { userId })
      .getMany();

    const userWorkspaceDtos = userWorkspaces.map((userWorkspace) =>
      this.convertToUserWorkspaceDto(userWorkspace),
    );

    return userWorkspaceDtos;
  }

  async findWorkspaceUsers(workspaceId: string): Promise<UserWorkspaceDto[]> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
      relations: ['workspace'],
    });

    const userWorkspaces =
      await this.userWorkspaceRepository.findWorkspaceUsers(workspace);

    const userWorkspaceDtos = userWorkspaces.map((userWorkspace) =>
      this.convertToUserWorkspaceDto(userWorkspace),
    );

    return userWorkspaceDtos;
  }

  async sendInvite(
    user: User,
    inviteUser: InviteUserDto,
  ): Promise<{ message: string }> {
    const { email, workspaceId } = inviteUser;

    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
      relations: ['workspace'],
    });

    const invitedUser = await this.userRepository.findOne({ where: { email } });

    if (invitedUser) {
      const userWorkspaceRecord = await this.userWorkspaceRepository.findOne({
        where: {
          user: { id: invitedUser.id },
          workspace: { id: workspace.id },
        },
      });

      if (userWorkspaceRecord) {
        throw new ConflictException(
          'This email is already registered as part of this workspace',
        );
      } else {
        await this.joinWorkspace(invitedUser, workspace.uuid);
        return {
          message: `${user.firstName} has been invited to ${workspace.name}.`,
        };
      }
    }

    const username = `${user.firstName[0].toUpperCase()}${user.firstName
      .substring(1)
      .toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName
      .substring(1)
      .toLowerCase()}`;

    const workspaceName = workspace.name;

    const userInvitePayload = {
      userId: user.uuid,
      workspaceId: workspace.uuid,
      type: 'userInvite',
    };

    const passwordResetToken = this.jwtService.sign(userInvitePayload, {
      expiresIn: '1d',
    });

    const url = `${process.env.CLIENT_BASE_URL}/register?token=${passwordResetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: `Sparx - Invitation to join ${workspaceName}`,
      template: 'invitation',
      context: {
        username,
        workspaceName,
        url,
      },
    });

    return { message: 'User has been invited to register.' };
  }

  async findLastViewedWorkspace(userId: string): Promise<UserWorkspaceDto> {
    const lastViewedUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { user: { uuid: userId } },
      order: { lastViewed: 'DESC' },
      relations: ['workspace'],
    });

    if (lastViewedUserWorkspace) {
      this.updateDayStreak(lastViewedUserWorkspace);
    }

    if (!lastViewedUserWorkspace) return;

    const userWorkspaceDto = this.convertToUserWorkspaceDto(
      lastViewedUserWorkspace,
    );

    return userWorkspaceDto;
  }

  async updateDayStreak(lastViewedWorkspace: UserWorkspace): Promise<void> {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLoginDate = new Date(lastViewedWorkspace.lastViewed).setHours(
      0,
      0,
      0,
      0,
    );

    const diffDays = (today - lastLoginDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      lastViewedWorkspace.streakCount += 1;
    } else if (diffDays > 1) {
      lastViewedWorkspace.streakCount = 1;
    }

    lastViewedWorkspace.lastViewed = new Date();
    await this.userWorkspaceRepository.save(lastViewedWorkspace);
  }

  async updateRole(uuid: string, isAdmin: boolean): Promise<UserWorkspaceDto> {
    const userWorkspaceFound = await this.userWorkspaceRepository.findOne({
      where: { uuid },
    });

    if (!userWorkspaceFound) {
      throw new NotFoundException(`UserWorkspace with ID ${uuid} not found`);
    }
    userWorkspaceFound.isAdmin = isAdmin;
    const userWorkspace = await this.userWorkspaceRepository.save(
      userWorkspaceFound,
    );

    const userWorkspaceDto = this.convertToUserWorkspaceDto(userWorkspace);

    return userWorkspaceDto;
  }

  async updateWorkspaceUser(
    uuid: string,
    updateUserWorkspaceDto: UpdateUserWorkspaceDto,
  ): Promise<UserWorkspaceDto> {
    const userWorkspaceFound = await this.userWorkspaceRepository.findOne({
      where: { uuid },
      relations: ['workspace'],
    });

    if (!userWorkspaceFound) {
      throw new NotFoundException(`UserWorkspace with ID ${uuid} not found`);
    }

    const userWorkspace = await this.userWorkspaceRepository.save({
      ...userWorkspaceFound,
      ...updateUserWorkspaceDto,
    });

    const userWorkspaceDto = this.convertToUserWorkspaceDto(userWorkspace);

    return userWorkspaceDto;
  }

  async updateLastViewed(
    userId: string,
    workspaceId: string,
  ): Promise<UserWorkspaceDto> {
    const userWorkspaceFound = await this.userWorkspaceRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
      relations: ['workspace'],
    });

    if (!userWorkspaceFound) {
      throw new NotFoundException(`UserWorkspace association not found`);
    }

    userWorkspaceFound.lastViewed = new Date();
    const userWorkspace = await this.userWorkspaceRepository.save(
      userWorkspaceFound,
    );

    const userWorkspaceDto = this.convertToUserWorkspaceDto(userWorkspace);

    return userWorkspaceDto;
  }

  async removeUserFromWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<{ message: string }> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
      relations: ['workspace'],
    });

    if (!userWorkspace) {
      throw new NotFoundException(`UserWorkspace association not found`);
    }

    await this.userWorkspaceRepository.remove(userWorkspace);
    return { message: 'User removed from workspace successfully' };
  }
}
