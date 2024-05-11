export class CreateWorkspaceDto {
  name: string;
  allowInvites?: boolean;
  isPrivate?: boolean;
  isTemporary?: boolean;
}
