import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskCompletedEvent } from './utils/task-completed';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { User } from 'src/users/entities/user.entity';
import { TaskDto } from './dto/task.dto';
import { plainToInstance } from 'class-transformer';
import { Task } from './entities/task.entity';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private taskRepository: TasksRepository,
    private eventEmitter: EventEmitter2,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  private convertToDto(task: Task): TaskDto {
    return plainToInstance(TaskDto, task);
  }

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

    return this.convertToDto(task);
  }

  async getTasksByUser(
    userId: string,
    workspaceId: string,
  ): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.getTasksByUser(userId, workspaceId);

    return tasks.map((task) => this.convertToDto(task));
  }

  async getTasksByWorkspace(workspaceId: string): Promise<TaskDto[]> {
    const tasks = await this.taskRepository.find({
      where: { workspace: { uuid: workspaceId } },
    });

    return tasks.map((task) => this.convertToDto(task));
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

    return this.convertToDto(updatedTask);
  }

  async updateTask(uuid: string, taskDto: UpdateTaskDto): Promise<TaskDto> {
    console.log(uuid, taskDto);
    await this.taskRepository.update({ uuid }, taskDto);
    const task = await this.taskRepository.findOne({ where: { uuid } });

    return this.convertToDto(task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
