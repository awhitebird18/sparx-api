import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/dto/Base.dto';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ChannelDto extends BaseDto {
  @ApiProperty({
    example: 'Announcements',
    description: 'Publicly displayed name of the channel',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Space id in which the channel belongs to.',
  })
  @IsOptional()
  @IsUUID(4)
  spaceId?: string;

  @ApiProperty({
    example: '77427689-934e-4642-863b-22bf6a77f89c',
    description: 'Company id in which the channel belongs to.',
  })
  @IsNotEmpty()
  @IsUUID(4)
  companyId: string;
}
