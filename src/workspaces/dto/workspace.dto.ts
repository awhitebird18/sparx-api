import { BaseDto } from 'src/common/dto';

export class WorkspaceDto extends BaseDto {
  name: string;

  isPrivate: boolean;

  allowInvite: boolean;

  imgUrl: string;
}
