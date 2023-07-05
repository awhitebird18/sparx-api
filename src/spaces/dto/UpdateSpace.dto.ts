import { PartialType } from '@nestjs/mapped-types';
import { CreateSpaceDto } from './CreateSpace.dto';

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {}
