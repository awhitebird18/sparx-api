import { BaseDto } from 'src/common/dto';

export class NodemapSettingsDto extends BaseDto {
  userCountVisible: boolean;
  flashcardsDueVisibile: boolean;
  unreadMessageCountVisible: boolean;
  scale: number;
  initialX: number;
  initialY: number;
}
