import { BaseDto } from 'src/common/dto';
import { User } from 'src/users/entities/user.entity';

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
  user: User;
}
