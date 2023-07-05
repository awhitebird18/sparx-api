import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { BaseDto } from 'src/common/dto/Base.dto';

export class SpaceDto extends BaseDto {
  @ApiProperty({
    example: 'Research and development',
    description: 'Name of the space.',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Id of the company',
  })
  @IsNotEmpty()
  @IsUUID()
  companyId: string;
}
