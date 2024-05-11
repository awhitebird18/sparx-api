import { Controller, Delete, Get, Param } from '@nestjs/common';
import { SeedService } from './seed.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('workspace-data/:workspaceId')
  async seedWorkspace(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ message: string }> {
    return this.seedService.seedWorkspaceData(user, workspaceId);
  }

  @Delete('workspace-data/:workspaceId')
  async deleteWorkspace(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    await this.seedService.removeWorkspace(workspaceId);
    await this.seedService.removeUser(user);
  }
}
