import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserWorkspacesService } from './user-workspaces.service';
import { UpdateUserWorkspaceDto } from './dto/update-user-workspace.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { InviteUserDto } from 'src/users/dto/invite-user.dto';
import { UserWorkspaceDto } from './dto/user-workspace.dto';

@Controller('user-workspaces')
export class UserWorkspacesController {
  constructor(private readonly userWorkspacesService: UserWorkspacesService) {}

  @Post('join/:workspaceId')
  joinWorkspace(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<UserWorkspaceDto> {
    return this.userWorkspacesService.joinWorkspace(user, workspaceId);
  }

  @Get()
  findUserWorkspaces(@GetUser() user: User): Promise<UserWorkspaceDto[]> {
    return this.userWorkspacesService.findUserWorkspaces(user.uuid);
  }

  @Get(':workspaceId')
  findAll(
    @Param('workspaceId') workspaceId: string,
  ): Promise<UserWorkspaceDto[]> {
    return this.userWorkspacesService.findWorkspaceUsers(workspaceId);
  }

  @Post('send-invite')
  sendInvite(
    @GetUser() currentUser: User,
    @Body() inviteUser: InviteUserDto,
  ): Promise<{ message: string }> {
    return this.userWorkspacesService.sendInvite(currentUser, inviteUser);
  }

  @Patch(':workspaceId/user')
  updateWorkspaceUser(
    @Param('workspaceId') workspaceId: string,
    @Body() updateUserWorkspaceDto: UpdateUserWorkspaceDto,
  ): Promise<UserWorkspaceDto> {
    return this.userWorkspacesService.updateWorkspaceUser(
      workspaceId,
      updateUserWorkspaceDto,
    );
  }

  @Patch(':workspaceId/role')
  updateRole(
    @Param('workspaceId') workspaceId: string,
    @Body() updateUserWorkspaceDto: UpdateUserWorkspaceDto,
  ): Promise<UserWorkspaceDto> {
    return this.userWorkspacesService.updateRole(
      workspaceId,
      updateUserWorkspaceDto.isAdmin,
    );
  }

  @Patch(':workspaceId/last-viewed')
  updateLastViewed(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<UserWorkspaceDto> {
    return this.userWorkspacesService.updateLastViewed(user.uuid, workspaceId);
  }

  @Delete(':workspaceId/leave')
  leaveWorkspace(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ message: string }> {
    return this.userWorkspacesService.removeUserFromWorkspace(
      user.uuid,
      workspaceId,
    );
  }

  @Delete(':userId/:workspaceId')
  removeUserFromWorkspace(
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ message: string }> {
    return this.userWorkspacesService.removeUserFromWorkspace(
      userId,
      workspaceId,
    );
  }
}
