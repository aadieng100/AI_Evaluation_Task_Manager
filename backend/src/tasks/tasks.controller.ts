import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskStatus } from '@prisma/client';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List all AI evaluation tasks with optional status and assignee filters' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false, description: 'Filter tasks by status' })
  @ApiQuery({ name: 'assigneeId', type: String, required: false, description: 'Filter tasks by assigned evaluator ID' })
  findAll(
    @Query('status') status?: TaskStatus,
    @Query('assigneeId') assigneeId?: string,
  ) {
    return this.tasksService.findAll(status, assigneeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific AI evaluation task' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new AI evaluation task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign an AI evaluation task to an internal evaluator' })
  assign(@Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.tasksService.assign(id, dto);
  }
}
