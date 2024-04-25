import { BaseDto } from 'src/common/dto';

export class UserWorkspaceDto extends BaseDto {
  bio: string;
  goal: string;
  isAdmin: boolean;
  isFirstLogin: boolean;
  lastViewed: Date;
  location: string;
  streakCount: number;
  website: string;
  workspaceId: string;
}
