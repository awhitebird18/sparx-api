import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskCompletedEvent } from './utils/task-completed';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { User } from 'src/users/entities/user.entity';
import { TaskDto } from './dto/task.dto';
import { plainToInstance } from 'class-transformer';

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
  ): Promise<TaskDto> {
    const workspace = await this.workspaceRepository.findOne({
      where: { uuid: workspaceId },
    });

    const newTask = this.taskRepository.create({ ...taskDto, workspace, user });
    const task = await this.taskRepository.save(newTask);

    return plainToInstance(TaskDto, task);
  }

  async toggleComplete(
    taskId: string,
    workspaceId: string,
    userId: string,
  ): Promise<TaskDto> {
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

    return plainToInstance(TaskDto, updatedTask);
  }

  async updateTask(id: string, taskDto: any): Promise<TaskDto> {
    await this.taskRepository.update(id, taskDto);
    const task = await this.taskRepository.findOne({ where: { uuid: id } });

    return plainToInstance(TaskDto, task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async getTasksByUser(
    userId: string,
    workspaceId: string,
  ): Promise<TaskDto[]> {
    const task = await this.taskRepository.getTasksByUser(userId, workspaceId);

    return plainToInstance(TaskDto, task);
  }

  async getTasksByWorkspace(workspaceId: string): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.find({
      where: { workspace: { uuid: workspaceId } },
    });

    return tasks.map((task) => plainToInstance(TaskDto, task));
  }
}
