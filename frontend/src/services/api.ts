import { EvaluationTask, User, CreateTaskInput, CreateEvaluationInput, EvaluationResult } from '../types';

const API_BASE_URL = 'http://localhost:3000';

// Fallback seed data in case backend is offline
const MOCK_USERS: User[] = [
  { id: 'usr-1', email: 'evaluator.alex@micro1.ai', name: 'Alex Evaluator', role: 'EVALUATOR', createdAt: new Date().toISOString() },
  { id: 'usr-2', email: 'evaluator.sarah@micro1.ai', name: 'Sarah AI Specialist', role: 'EVALUATOR', createdAt: new Date().toISOString() },
  { id: 'usr-3', email: 'admin@micro1.ai', name: 'Platform Administrator', role: 'ADMIN', createdAt: new Date().toISOString() },
];

let MOCK_TASKS: EvaluationTask[] = [
  {
    id: 'task-1',
    title: 'Python N-Queens Backtracking Optimization',
    prompt: 'Write an optimized Python solution for N-Queens returning all distinct solutions.',
    modelAName: 'Claude 3.5 Sonnet',
    modelBName: 'GPT-4o',
    modelA: `def solveNQueens(n: int):\n    def backtrack(r, cols, posDiag, negDiag):\n        if r == n:\n            res.append(["".join(row) for row in board])\n            return\n        for c in range(n):\n            if c in cols or (r + c) in posDiag or (r - c) in negDiag:\n                continue\n            cols.add(c); posDiag.add(r + c); negDiag.remove(r - c)\n            board[r][c] = "Q"\n            backtrack(r + 1, cols, posDiag, negDiag)\n            cols.remove(c); posDiag.remove(r + c); negDiag.remove(r - c)\n            board[r][c] = "."\n    res = []; board = [["."] * n for _ in range(n)]\n    backtrack(0, set(), set(), set())\n    return res`,
    modelB: `class Solution:\n    def solveNQueens(self, n: int):\n        res = []\n        def dfs(queens, xy_dif, xy_sum):\n            p = len(queens)\n            if p == n:\n                res.append(queens)\n                return\n            for q in range(n):\n                if q not in queens and p-q not in xy_dif and p+q not in xy_sum:\n                    dfs(queens+[q], xy_dif+[p-q], xy_sum+[p+q])\n        dfs([], [], [])\n        return [["."*i + "Q" + "."*(n-i-1) for i in sol] for sol in res]`,
    priority: 5,
    status: 'ASSIGNED',
    assigneeId: 'usr-1',
    assignee: MOCK_USERS[0],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'SQL Window Functions vs Subqueries',
    prompt: 'Write a SQL query to find the 2nd highest salary per department.',
    modelAName: 'Llama 3 70B',
    modelBName: 'Gemini 1.5 Pro',
    modelA: `WITH RankedSalaries AS (\n  SELECT employee_id, department_id, salary,\n         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk\n  FROM employees\n)\nSELECT employee_id, department_id, salary\nFROM RankedSalaries\nWHERE rnk = 2;`,
    modelB: `SELECT e1.employee_id, e1.department_id, e1.salary\nFROM employees e1\nWHERE 1 = (\n  SELECT COUNT(DISTINCT e2.salary)\n  FROM employees e2\n  WHERE e2.department_id = e1.department_id AND e2.salary > e1.salary\n);`,
    priority: 3,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'TypeScript Dynamic Generic Middleware',
    prompt: 'Create a type-safe generic middleware wrapper in TypeScript for NestJS handlers.',
    modelAName: 'Claude 3.5 Sonnet',
    modelBName: 'GPT-4o',
    modelA: `export type AsyncHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;\nexport function createMiddleware<TInput, TOutput>(handler: AsyncHandler<TInput, TOutput>) {\n  return async (req: TInput): Promise<TOutput> => {\n    console.log('[Middleware] Execution started');\n    return handler(req);\n  };\n}`,
    modelB: `export const wrapMiddleware = (fn: Function) => async (req: any, res: any, next: Function) => {\n  try {\n    await fn(req);\n    next();\n  } catch (err) {\n    next(err);\n  }\n};`,
    priority: 4,
    status: 'COMPLETED',
    assigneeId: 'usr-2',
    assignee: MOCK_USERS[1],
    evaluations: [
      {
        id: 'eval-1',
        taskId: 'task-3',
        evaluatorId: 'usr-2',
        preferredOutput: 'OUTPUT_A',
        rating: 5,
        feedback: 'Model A (Claude 3.5 Sonnet) provided a strictly typed generic implementation with proper TypeScript type inference. Model B used `any` types.',
        metrics: { accuracy: 5, safety: 5, latencyScore: 4, conciseness: 5 },
        createdAt: new Date().toISOString(),
        evaluator: MOCK_USERS[1],
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchTasks(status?: string): Promise<EvaluationTask[]> {
  try {
    const url = status ? `${API_BASE_URL}/tasks?status=${status}` : `${API_BASE_URL}/tasks`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, using local state mock:', err);
    if (status) return MOCK_TASKS.filter((t) => t.status === status);
    return MOCK_TASKS;
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch {
    return MOCK_USERS;
  }
}

export async function createTask(input: CreateTaskInput): Promise<EvaluationTask> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return await res.json();
  } catch {
    const newTask: EvaluationTask = {
      id: `task-${Date.now()}`,
      title: input.title,
      prompt: input.prompt,
      modelA: input.modelA,
      modelB: input.modelB,
      modelAName: input.modelAName || 'Model A',
      modelBName: input.modelBName || 'Model B',
      priority: input.priority || 1,
      status: input.assigneeId ? 'ASSIGNED' : 'PENDING',
      assigneeId: input.assigneeId,
      assignee: MOCK_USERS.find((u) => u.id === input.assigneeId) || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_TASKS.unshift(newTask);
    return newTask;
  }
}

export async function assignTask(taskId: string, assigneeId: string): Promise<EvaluationTask> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeId }),
    });
    if (!res.ok) throw new Error('Failed to assign task');
    return await res.json();
  } catch {
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    const user = MOCK_USERS.find((u) => u.id === assigneeId);
    if (task) {
      task.assigneeId = assigneeId;
      task.assignee = user || null;
      if (task.status === 'PENDING') task.status = 'ASSIGNED';
    }
    return task!;
  }
}

export async function submitEvaluation(input: CreateEvaluationInput): Promise<EvaluationResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to submit evaluation');
    return await res.json();
  } catch {
    const newEval: EvaluationResult = {
      id: `eval-${Date.now()}`,
      taskId: input.taskId,
      evaluatorId: input.evaluatorId,
      preferredOutput: input.preferredOutput,
      rating: input.rating,
      feedback: input.feedback,
      metrics: input.metrics,
      createdAt: new Date().toISOString(),
      evaluator: MOCK_USERS.find((u) => u.id === input.evaluatorId),
    };
    const task = MOCK_TASKS.find((t) => t.id === input.taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.evaluations = [newEval];
    }
    return newEval;
  }
}
