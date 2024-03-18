export class CreateNoteDto {
  title?: string;
  content?: string;
  isPrivate?: boolean;
  channelId: string;
  workspaceId: string;
}
