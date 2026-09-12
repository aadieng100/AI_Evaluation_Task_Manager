import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { PrismaService } from '../prisma/prisma.service';
import { PreferredOutput, TaskStatus } from '@prisma/client';

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let prisma: PrismaService;

  const mockEvaluation = {
    id: 'eval-1',
    taskId: 'task-1',
    evaluatorId: 'user-1',
    preferredOutput: PreferredOutput.OUTPUT_A,
    rating: 5,
    feedback: 'Model A produced a clearer and more structured explanation.',
    metrics: { accuracy: 5, coherence: 5 },
    createdAt: new Date(),
  };

  const mockTask = {
    id: 'task-1',
    title: 'Explain Quantum Computing',
    prompt: 'Provide an overview of qubits and superposition',
    modelA: 'Response A',
    modelB: 'Response B',
    modelAName: 'GPT-4o',
    modelBName: 'Claude 3.5 Sonnet',
    status: TaskStatus.ASSIGNED,
    priority: 2,
    assigneeId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'evaluator@micro1.ai',
    name: 'Alice Evaluator',
    role: 'EVALUATOR',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    evaluationResult: {
      findMany: jest.fn().mockResolvedValue([mockEvaluation]),
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue(mockEvaluation),
    },
    evaluationTask: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of evaluations', async () => {
      mockPrismaService.evaluationResult.findMany.mockResolvedValue([mockEvaluation]);
      const result = await service.findAll();
      expect(result).toEqual([mockEvaluation]);
      expect(prisma.evaluationResult.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an evaluation when found', async () => {
      mockPrismaService.evaluationResult.findUnique.mockResolvedValue(mockEvaluation);
      const result = await service.findOne('eval-1');
      expect(result).toEqual(mockEvaluation);
      expect(prisma.evaluationResult.findUnique).toHaveBeenCalledWith({
        where: { id: 'eval-1' },
        include: { task: true, evaluator: true },
      });
    });

    it('should throw NotFoundException when evaluation is not found', async () => {
      mockPrismaService.evaluationResult.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      taskId: 'task-1',
      evaluatorId: 'user-1',
      preferredOutput: PreferredOutput.OUTPUT_A,
      rating: 5,
      feedback: 'Model A produced a clearer and more structured explanation.',
      metrics: { accuracy: 5, coherence: 5 },
    };

    it('should throw NotFoundException if task does not exist', async () => {
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(prisma.evaluationTask.findUnique).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('should throw NotFoundException if evaluator does not exist', async () => {
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should atomically create evaluation and mark task as COMPLETED in a transaction', async () => {
      mockPrismaService.evaluationTask.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback: (tx: any) => Promise<any>) => {
        const txMock = {
          evaluationResult: {
            create: jest.fn().mockResolvedValue(mockEvaluation),
          },
          evaluationTask: {
            update: jest.fn().mockResolvedValue({ ...mockTask, status: TaskStatus.COMPLETED }),
          },
        };
        return callback(txMock);
      });

      const result = await service.create(createDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockEvaluation);
    });
  });
});
