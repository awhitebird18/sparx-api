import { Brackets, DataSource, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getTasksByUser(userId: string, workspaceId: string): Promise<Task[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize current date to midnight for comparison

    return (
      this.createQueryBuilder('task')
        .leftJoinAndSelect('task.user', 'user')
        .leftJoinAndSelect('task.workspace', 'workspace')
        .where('user.uuid = :userId AND workspace.uuid = :workspaceId', {
          userId,
          workspaceId,
        })
        // Tasks that are not due yet or are due today and marked as complete
        .andWhere(
          new Brackets((qb) => {
            qb.where('task.dueDate > :currentDate', { currentDate }).orWhere(
              new Brackets((qbInner) => {
                qbInner
                  .where('task.dueDate = :currentDate', { currentDate })
                  .andWhere('task.isComplete = :isComplete', {
                    isComplete: true,
                  });
              }),
            );
          }),
        )
        // Or tasks that are past due and not marked as complete
        .orWhere(
          new Brackets((qb) => {
            qb.where('task.dueDate < :currentDate', { currentDate }).andWhere(
              'task.isComplete = :isNotComplete',
              { isNotComplete: false },
            );
          }),
        )
        .getMany()
    );
  }
}
