import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Body() taskDto: any, @GetUser() user: User): Promise<Task> {
    return this.tasksService.createTask(taskDto, user, taskDto.workspaceId);
  }

  @Patch('/toggle-complete/:taskId/:workspaceId')
  toggleComplete(
    @Param('taskId') taskId: string,
    @Param('workspaceId') workspaceId: string,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.toggleComplete(taskId, workspaceId, user.uuid);
  }

  @Patch('/:id')
  updateTask(@Param('id') id: string, @Body() taskDto: any): Promise<Task> {
    return this.tasksService.updateTask(id, taskDto);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.tasksService.deleteTask(id);
  }

  @Get('/user/:workspaceId')
  getTasksByUser(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<Task[]> {
    return this.tasksService.getTasksByUser(user.uuid, workspaceId);
  }

  @Get('/workspace/:workspaceId')
  getTasksByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<Task[]> {
    return this.tasksService.getTasksByWorkspace(workspaceId);
  }
}
