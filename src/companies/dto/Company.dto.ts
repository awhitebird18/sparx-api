import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/dto/base.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompanyDto extends BaseDto {
  @ApiProperty({
    example: 'Chatapp company',
    description: 'Publicly displayed name of the company',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Company id in which the channel belongs to.',
  })
  @IsNotEmpty()
  @IsUUID(4)
  companyId: string;
}
