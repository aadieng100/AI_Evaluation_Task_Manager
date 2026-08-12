import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.evaluationResult.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        task: { select: { id: true, title: true, status: true, modelAName: true, modelBName: true } },
        evaluator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const evaluation = await this.prisma.evaluationResult.findUnique({
      where: { id },
      include: {
        task: true,
        evaluator: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID "${id}" not found.`);
    }

    return evaluation;
  }

  async create(dto: CreateEvaluationDto) {
    // Check task existence
    const task = await this.prisma.evaluationTask.findUnique({ where: { id: dto.taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${dto.taskId}" not found.`);
    }

    // Check evaluator existence
    const evaluator = await this.prisma.user.findUnique({ where: { id: dto.evaluatorId } });
    if (!evaluator) {
      throw new NotFoundException(`Evaluator with ID "${dto.evaluatorId}" not found.`);
    }

    // Transaction: Create evaluation result and mark task as COMPLETED
    return this.prisma.$transaction(async (tx) => {
      const evaluation = await tx.evaluationResult.create({
        data: {
          taskId: dto.taskId,
          evaluatorId: dto.evaluatorId,
          preferredOutput: dto.preferredOutput,
          rating: dto.rating,
          feedback: dto.feedback,
          metrics: dto.metrics || {},
        },
        include: {
          task: true,
          evaluator: true,
        },
      });

      await tx.evaluationTask.update({
        where: { id: dto.taskId },
        data: {
          status: TaskStatus.COMPLETED,
        },
      });

      return evaluation;
    });
  }
}
