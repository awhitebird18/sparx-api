import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityDto } from './dto/activity.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('workspace/:workspaceId')
  async getWorkspaceActivity(
    @Query('page') page: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ActivityDto[]> {
    return this.activityService.getRecentWorkspaceActivity(workspaceId, page);
  }

  @Get('user/:workspaceId/:userId')
  async getUserActivity(
    @Query('page') page: string,
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ActivityDto[]> {
    return this.activityService.getUserActivity(userId, workspaceId, page);
  }
}
