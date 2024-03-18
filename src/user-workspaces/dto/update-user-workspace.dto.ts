import { PartialType } from '@nestjs/swagger';
import { CreateUserWorkspaceDto } from './create-user-workspace.dto';

export class UpdateUserWorkspaceDto extends PartialType(
  CreateUserWorkspaceDto,
) {}
