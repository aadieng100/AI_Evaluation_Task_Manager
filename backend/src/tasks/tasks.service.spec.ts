import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'evaluator@micro1.ai',
    name: 'Alice Evaluator',
    role: 'EVALUATOR',
  };

  const mockTask = {
    id: 'task-1',
    title: 'Code review assistant evaluation',
    prompt: 'Compare two pull request review generations',
    modelA: 'Review A',
    modelB: 'Review B',
    modelAName: 'GPT-4o',
    modelBName: 'Claude 3.5 Sonnet',
    status: TaskStatus.PENDING,
    priority: 3,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    evaluationTask: {
      findMany: jest.fn().mockResolvedValue([mockTask]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query tasks with status and assigneeId filters', async () => {
      mockPrismaService.evaluationTask.findMany.mockResolvedValue([mockTask]);

      const result = await service.findAll(TaskStatus.PENDING, 'user-1');

      expect(prisma.evaluationTask.findMany).toHaveBeenCalledWith({
        where: {
          status: TaskStatus.PENDING,
          assigneeId: 'user-1',
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          assignee: {
            select: { id: true, name: true, email: true, role: true },
          },
          evaluations: true,
        },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue(mockTask);
      const result = await service.findOne('task-1');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a task with PENDING status when no assignee is provided', async () => {
      const createDto = {
        title: 'New Evaluation Task',
        prompt: 'Prompt text',
        modelA: 'Output A',
        modelB: 'Output B',
      };

      mockPrismaService.evaluationTask.create.mockResolvedValue({
        ...mockTask,
        ...createDto,
        status: TaskStatus.PENDING,
      });

      const result = await service.create(createDto);

      expect(prisma.evaluationTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TaskStatus.PENDING,
            assigneeId: undefined,
          }),
        }),
      );
      expect(result.status).toBe(TaskStatus.PENDING);
    });

    it('should create a task with ASSIGNED status when assigneeId is provided', async () => {
      const createDto = {
        title: 'New Evaluation Task',
        prompt: 'Prompt text',
        modelA: 'Output A',
        modelB: 'Output B',
        assigneeId: 'user-1',
      };

      mockPrismaService.evaluationTask.create.mockResolvedValue({
        ...mockTask,
        ...createDto,
        status: TaskStatus.ASSIGNED,
      });

      const result = await service.create(createDto);

      expect(prisma.evaluationTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TaskStatus.ASSIGNED,
            assigneeId: 'user-1',
          }),
        }),
      );
      expect(result.status).toBe(TaskStatus.ASSIGNED);
    });
  });

  describe('assign', () => {
    it('should throw NotFoundException if user to assign does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.assign('task-1', { assigneeId: 'invalid-user' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue(null);

      await expect(service.assign('invalid-task', { assigneeId: 'user-1' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should assign user and transition status from PENDING to ASSIGNED', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue({
        ...mockTask,
        status: TaskStatus.PENDING,
      });
      mockPrismaService.evaluationTask.update.mockResolvedValue({
        ...mockTask,
        assigneeId: 'user-1',
        status: TaskStatus.ASSIGNED,
      });

      const result = await service.assign('task-1', { assigneeId: 'user-1' });

      expect(prisma.evaluationTask.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: {
          assigneeId: 'user-1',
          status: TaskStatus.ASSIGNED,
        },
        include: { assignee: true },
      });
      expect(result.status).toBe(TaskStatus.ASSIGNED);
    });
  });
});
