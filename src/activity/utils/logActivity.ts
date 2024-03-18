export class LogActivity {
  constructor(
    public readonly userId: string,
    public readonly workspaceId: string,
    public readonly type: string,
    public readonly text: string,
  ) {}
}
