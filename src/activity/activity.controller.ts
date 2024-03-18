import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('workspace/:workspaceId')
  async getWorkspaceActivity(@Param('workspaceId') workspaceId: string) {
    return this.activityService.getRecentWorkspaceActivity(workspaceId);
  }

  @Get('user')
  async getUserActivity(
    @Query('userId') userId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.activityService.getUserActivity(userId, workspaceId);
  }
}
