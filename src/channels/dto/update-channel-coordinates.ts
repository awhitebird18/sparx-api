import { IsNumber, IsString } from 'class-validator';

export class UpdateChannelCoordinatesDto {
  @IsString()
  uuid: string;

  @IsNumber()
  x?: number;

  @IsNumber()
  y?: number;
}
