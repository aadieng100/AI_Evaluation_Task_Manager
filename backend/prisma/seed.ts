import { PrismaClient, Role, TaskStatus, PreferredOutput } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.evaluationResult.deleteMany();
  await prisma.evaluationTask.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@micro1.ai',
      name: 'Platform Administrator',
      role: Role.ADMIN,
    },
  });

  const evaluatorAlex = await prisma.user.create({
    data: {
      email: 'evaluator.alex@micro1.ai',
      name: 'Alex Evaluator',
      role: Role.EVALUATOR,
    },
  });

  const evaluatorSarah = await prisma.user.create({
    data: {
      email: 'evaluator.sarah@micro1.ai',
      name: 'Sarah AI Specialist',
      role: Role.EVALUATOR,
    },
  });

  console.log(`✅ Created 3 seed users (Admin, Alex, Sarah).`);

  // Create Tasks
  const task1 = await prisma.evaluationTask.create({
    data: {
      title: 'Python N-Queens Backtracking Optimization',
      prompt: 'Write an optimized Python solution for N-Queens returning all distinct solutions.',
      modelAName: 'Claude 3.5 Sonnet',
      modelBName: 'GPT-4o',
      modelA: `def solveNQueens(n: int):\n    def backtrack(r, cols, posDiag, negDiag):\n        if r == n:\n            res.append(["".join(row) for row in board])\n            return\n        for c in range(n):\n            if c in cols or (r + c) in posDiag or (r - c) in negDiag:\n                continue\n            cols.add(c); posDiag.add(r + c); negDiag.add(r - c)\n            board[r][c] = "Q"\n            backtrack(r + 1, cols, posDiag, negDiag)\n            cols.remove(c); posDiag.remove(r + c); negDiag.remove(r - c)\n            board[r][c] = "."\n    res = []; board = [["."] * n for _ in range(n)]\n    backtrack(0, set(), set(), set())\n    return res`,
      modelB: `class Solution:\n    def solveNQueens(self, n: int):\n        res = []\n        def dfs(queens, xy_dif, xy_sum):\n            p = len(queens)\n            if p == n:\n                res.append(queens)\n                return\n            for q in range(n):\n                if q not in queens and p-q not in xy_dif and p+q not in xy_sum:\n                    dfs(queens+[q], xy_dif+[p-q], xy_sum+[p+q])\n        dfs([], [], [])\n        return [["."*i + "Q" + "."*(n-i-1) for i in sol] for sol in res]`,
      priority: 5,
      status: TaskStatus.ASSIGNED,
      assigneeId: evaluatorAlex.id,
    },
  });

  const task2 = await prisma.evaluationTask.create({
    data: {
      title: 'SQL Window Functions vs Subqueries',
      prompt: 'Write a SQL query to find the 2nd highest salary per department.',
      modelAName: 'Llama 3 70B',
      modelBName: 'Gemini 1.5 Pro',
      modelA: `WITH RankedSalaries AS (\n  SELECT employee_id, department_id, salary,\n         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk\n  FROM employees\n)\nSELECT employee_id, department_id, salary\nFROM RankedSalaries\nWHERE rnk = 2;`,
      modelB: `SELECT e1.employee_id, e1.department_id, e1.salary\nFROM employees e1\nWHERE 1 = (\n  SELECT COUNT(DISTINCT e2.salary)\n  FROM employees e2\n  WHERE e2.department_id = e1.department_id AND e2.salary > e1.salary\n);`,
      priority: 3,
      status: TaskStatus.PENDING,
    },
  });

  const task3 = await prisma.evaluationTask.create({
    data: {
      title: 'TypeScript Dynamic Generic Middleware',
      prompt: 'Create a type-safe generic middleware wrapper in TypeScript for NestJS handlers.',
      modelAName: 'Claude 3.5 Sonnet',
      modelBName: 'GPT-4o',
      modelA: `export type AsyncHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;\nexport function createMiddleware<TInput, TOutput>(handler: AsyncHandler<TInput, TOutput>) {\n  return async (req: TInput): Promise<TOutput> => {\n    console.log('[Middleware] Execution started');\n    return handler(req);\n  };\n}`,
      modelB: `export const wrapMiddleware = (fn: Function) => async (req: any, res: any, next: Function) => {\n  try {\n    await fn(req);\n    next();\n  } catch (err) {\n    next(err);\n  }\n};`,
      priority: 4,
      status: TaskStatus.COMPLETED,
      assigneeId: evaluatorSarah.id,
    },
  });

  console.log(`✅ Created 3 sample evaluation tasks.`);

  // Create 1 completed evaluation result for task 3
  await prisma.evaluationResult.create({
    data: {
      taskId: task3.id,
      evaluatorId: evaluatorSarah.id,
      preferredOutput: PreferredOutput.OUTPUT_A,
      rating: 5,
      feedback: 'Model A (Claude 3.5 Sonnet) provided a strictly typed generic implementation with proper TypeScript type inference. Model B used `any` types.',
      metrics: {
        typeSafety: 5,
        codeQuality: 5,
        idiomaticLevel: 5,
        latencyScore: 4,
      },
    },
  });

  console.log(`✅ Created seed evaluation submission.`);
  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
