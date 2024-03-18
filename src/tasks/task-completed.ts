// task-completed.event.ts
export class TaskCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly workspaceId: string,
    public readonly points: number,
  ) {}
}
