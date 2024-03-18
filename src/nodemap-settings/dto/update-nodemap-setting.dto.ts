import { PartialType } from '@nestjs/swagger';
import { CreateNodemapSettingDto } from './create-nodemap-setting.dto';

export class UpdateNodemapSettingDto extends PartialType(
  CreateNodemapSettingDto,
) {}
