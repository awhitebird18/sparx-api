import { BaseDto } from 'src/common/dto';

export class NodemapSettingsDto extends BaseDto {
  userCountVisible: boolean;
  flashcardsDueVisibile: boolean;
  unreadMessageCountVisible: boolean;
  zoomLevel: number;
  xPosition: number;
  yPosition: number;
}
