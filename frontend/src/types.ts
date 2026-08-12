export type Role = 'ADMIN' | 'EVALUATOR';

export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_REVIEW' | 'COMPLETED';

export type PreferredOutput = 'OUTPUT_A' | 'OUTPUT_B' | 'EQUAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface EvaluationResult {
  id: string;
  taskId: string;
  evaluatorId: string;
  preferredOutput: PreferredOutput;
  rating: number;
  feedback: string;
  metrics?: Record<string, any>;
  createdAt: string;
  evaluator?: User;
}

export interface EvaluationTask {
  id: string;
  title: string;
  prompt: string;
  modelA: string;
  modelB: string;
  modelAName: string;
  modelBName: string;
  status: TaskStatus;
  priority: number;
  assigneeId?: string | null;
  assignee?: User | null;
  evaluations?: EvaluationResult[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  prompt: string;
  modelA: string;
  modelB: string;
  modelAName?: string;
  modelBName?: string;
  priority?: number;
  assigneeId?: string;
}

export interface CreateEvaluationInput {
  taskId: string;
  evaluatorId: string;
  preferredOutput: PreferredOutput;
  rating: number;
  feedback: string;
  metrics?: {
    accuracy?: number;
    safety?: number;
    latencyScore?: number;
    conciseness?: number;
  };
}
