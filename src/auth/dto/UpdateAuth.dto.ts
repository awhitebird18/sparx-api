import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './CreateAuth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
