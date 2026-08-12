import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: TaskStatus, assigneeId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    return this.prisma.evaluationTask.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        evaluations: true,
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.evaluationTask.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        evaluations: {
          include: {
            evaluator: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found.`);
    }

    return task;
  }

  async create(dto: CreateTaskDto) {
    const initialStatus = dto.assigneeId ? TaskStatus.ASSIGNED : TaskStatus.PENDING;

    return this.prisma.evaluationTask.create({
      data: {
        title: dto.title,
        prompt: dto.prompt,
        modelA: dto.modelA,
        modelB: dto.modelB,
        modelAName: dto.modelAName || 'Model A',
        modelBName: dto.modelBName || 'Model B',
        priority: dto.priority || 1,
        status: initialStatus,
        assigneeId: dto.assigneeId,
      },
      include: {
        assignee: true,
      },
    });
  }

  async assign(id: string, dto: AssignTaskDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.assigneeId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${dto.assigneeId}" not found.`);
    }

    const task = await this.prisma.evaluationTask.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found.`);
    }

    return this.prisma.evaluationTask.update({
      where: { id },
      data: {
        assigneeId: dto.assigneeId,
        status: task.status === TaskStatus.PENDING ? TaskStatus.ASSIGNED : task.status,
      },
      include: {
        assignee: true,
      },
    });
  }
}
