import { BaseDto } from 'src/common/dto/base.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompanyDto extends BaseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID(4)
  companyId: string;
}
