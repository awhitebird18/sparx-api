import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { Task } from './entities/task.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskCompletedEvent } from './task-completed';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    private taskRepository: TasksRepository,
    private eventEmitter: EventEmitter2,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  async createTask(
    taskDto: { name: string; dueDate: Date },
    user: User,
    workspaceId: string,
  ): Promise<any> {
    const workspace = await this.workspaceRepository.findOne({
      where: { uuid: workspaceId },
    });

    const newTask = this.taskRepository.create({ ...taskDto, workspace, user });
    return this.taskRepository.save(newTask);
  }

  async toggleComplete(
    taskId: string,
    workspaceId: string,
    userId: string,
  ): Promise<Task> {
    const taskFound = await this.taskRepository.findOne({
      where: { uuid: taskId },
    });

    const updatedTask = await this.taskRepository.save({
      ...taskFound,
      isComplete: !taskFound.isComplete,
    });

    if (!updatedTask) {
      throw new Error('Unable to mark task as completed');
    }

    let points = 100;

    if (!updatedTask.isComplete) {
      points *= -1;
    }

    this.eventEmitter.emit(
      'task.completed',
      new TaskCompletedEvent(userId, workspaceId, points),
    );

    return updatedTask;
  }

  async updateTask(id: string, taskDto: any): Promise<Task> {
    await this.taskRepository.update(id, taskDto);
    return this.taskRepository.findOne({ where: { uuid: id } });
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async getTasksByUser(userId: string, workspaceId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
    });
  }

  async getTasksByWorkspace(workspaceId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { workspace: { uuid: workspaceId } },
    });
  }
}
