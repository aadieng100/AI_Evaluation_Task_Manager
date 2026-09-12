import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'admin@micro1.ai',
    name: 'Admin User',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn().mockResolvedValue([mockUser]),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users with task and evaluation counts', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findOne('user-1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { tasks: true, evaluations: true },
      });
    });
  });

  describe('create', () => {
    const createUserDto = {
      email: 'newuser@micro1.ai',
      name: 'New User',
      role: Role.EVALUATOR,
    };

    it('should throw ConflictException if user with same email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });

    it('should create and return a new user if email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: 'user-2', ...createUserDto });

      const result = await service.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: createUserDto });
      expect(result.id).toBe('user-2');
      expect(result.email).toBe(createUserDto.email);
    });
  });
});
