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

@Injectable()
export class UserWorkspacesService {
  constructor(
    private userWorkspaceRepository: UserWorkspacesRepository,
    private workspaceRepository: WorkspacesRepository,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private userRepository: UsersRepository,
  ) {}

  async joinWorkspace(user: User, workspaceId: string) {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const workspaceUsers = await this.userWorkspaceRepository.find({
      where: { workspace: { id: workspace.id } },
    });

    const isAdmin = workspaceUsers.length === 0;

    const userWorkspaceRecord =
      await this.userWorkspaceRepository.joinWorkspace(
        user,
        workspace,
        isAdmin,
      );

    return userWorkspaceRecord;
  }

  findUserWorkspaces(userId: string) {
    return this.userWorkspaceRepository
      .createQueryBuilder('userWorkspace')
      .leftJoin('userWorkspace.workspace', 'workspace')
      .leftJoin('userWorkspace.user', 'user')
      .addSelect(['workspace.uuid']) // Alias the selected column
      .where('user.uuid = :userId', { userId })
      .getMany();
  }

  async findWorkspaceUsers(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });
    return this.userWorkspaceRepository.findWorkspaceUsers(workspace);
  }

  async sendInvite(
    user: User,
    inviteUser: InviteUserDto,
  ): Promise<{ message: string }> {
    const { email, workspaceId } = inviteUser;

    // Todo: once workspaces are implemented, need to find the users workspace to
    // to be able to add workspace name and details in the email.

    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
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

    // Format name of user who is sending the invite
    const username = `${user.firstName[0].toUpperCase()}${user.firstName
      .substring(1)
      .toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName
      .substring(1)
      .toLowerCase()}`;

    // Format name of workspace
    const workspaceName = workspace.name;

    // Generate payload for token
    const userInvitePayload = {
      userId: user.uuid,
      workspaceId: workspace.uuid,
      type: 'userInvite',
    };

    // Generate a password reset token
    const passwordResetToken = this.jwtService.sign(userInvitePayload, {
      expiresIn: '1d',
    });

    const url = `${process.env.CLIENT_BASE_URL}/register?token=${passwordResetToken}`;

    // Email user informing of the password change
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

  async findLastViewedWorkspace(userId: string) {
    // Find the most recent UserWorkspace entry for this user
    const lastViewedEntry = await this.userWorkspaceRepository.findOne({
      where: { user: { uuid: userId } },
      order: { lastViewed: 'DESC' },
      relations: ['workspace'], // Make sure to load the workspace relation
    });

    if (lastViewedEntry) {
      this.updateDayStreak(lastViewedEntry);
    }

    // Return the workspace entity
    return lastViewedEntry?.workspace;
  }

  async updateDayStreak(lastViewedWorkspace: UserWorkspace): Promise<void> {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLoginDate = new Date(lastViewedWorkspace.lastViewed).setHours(
      0,
      0,
      0,
      0,
    );

    // Calculate the difference in days
    const diffDays = (today - lastLoginDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      // Increment streak if user logged in the day after their last login
      lastViewedWorkspace.streakCount += 1;
    } else if (diffDays > 1) {
      // Reset streak if there's a gap of more than one day
      lastViewedWorkspace.streakCount = 1;
    }

    lastViewedWorkspace.lastViewed = new Date(); // Set last login to today
    await this.userWorkspaceRepository.save(lastViewedWorkspace);
  }

  async updateRole(uuid: string, isAdmin: boolean) {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { uuid },
    });

    if (!userWorkspace) {
      throw new NotFoundException(`UserWorkspace with ID ${uuid} not found`);
    }
    userWorkspace.isAdmin = isAdmin;
    await this.userWorkspaceRepository.save(userWorkspace);
    return userWorkspace;
  }

  async updateWorkspaceUser(
    uuid: string,
    updateUserWorkspaceDto: UpdateUserWorkspaceDto,
  ) {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { uuid },
    });

    if (!userWorkspace) {
      throw new NotFoundException(`UserWorkspace with ID ${uuid} not found`);
    }

    const userWorkspaceToReturn = await this.userWorkspaceRepository.save({
      ...userWorkspace,
      ...updateUserWorkspaceDto,
    });

    return userWorkspaceToReturn;
  }

  async updateLastViewed(userId: string, workspaceId: string) {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
    });

    if (!userWorkspace) {
      throw new NotFoundException(`UserWorkspace association not found`);
    }

    userWorkspace.lastViewed = new Date();
    return await this.userWorkspaceRepository.save(userWorkspace);
  }

  async removeUserFromWorkspace(userId: string, workspaceId: string) {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
    });

    if (!userWorkspace) {
      throw new NotFoundException(`UserWorkspace association not found`);
    }

    await this.userWorkspaceRepository.remove(userWorkspace);
    return { message: 'User removed from workspace successfully' };
  }
}
