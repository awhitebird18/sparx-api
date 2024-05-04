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
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { TaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Body() taskDto: any, @GetUser() user: User): Promise<TaskDto> {
    return this.tasksService.createTask(taskDto, user, taskDto.workspaceId);
  }

  @Get('/user/:workspaceId')
  getTasksByUser(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<TaskDto[]> {
    return this.tasksService.getTasksByUser(user.uuid, workspaceId);
  }

  @Get('/workspace/:workspaceId')
  getTasksByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<TaskDto[]> {
    return this.tasksService.getTasksByWorkspace(workspaceId);
  }

  @Patch('/toggle-complete/:taskId/:workspaceId')
  toggleComplete(
    @Param('taskId') taskId: string,
    @Param('workspaceId') workspaceId: string,
    @GetUser() user: User,
  ): Promise<TaskDto> {
    return this.tasksService.toggleComplete(taskId, workspaceId, user.uuid);
  }

  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() { task }: { task: UpdateTaskDto },
  ): Promise<TaskDto> {
    return this.tasksService.updateTask(id, task);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.tasksService.deleteTask(id);
  }
}
