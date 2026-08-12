import React from 'react';
import { EvaluationTask } from '../types';
import { UserCheck, Sparkles, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: EvaluationTask;
  onSelectTask: (task: EvaluationTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserCheck className="w-3.5 h-3.5" /> Assigned
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5" /> In Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Pending Assignment
          </span>
        );
    }
  };

  const latestEvaluation = task.evaluations?.[0];

  return (
    <div 
      onClick={() => onSelectTask(task)}
      className="glass-card glass-card-hover p-6 rounded-2xl cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {getStatusBadge(task.status)}
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              P{task.priority} Priority
            </span>
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
          {task.title}
        </h3>

        {/* Prompt snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono">
          {task.prompt}
        </p>

        {/* AI Models Comparison Pill */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-4">
          <span className="font-semibold text-indigo-400">{task.modelAName}</span>
          <span className="text-[10px] uppercase font-bold text-slate-500">VS</span>
          <span className="font-semibold text-purple-400">{task.modelBName}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px] border border-indigo-500/30">
            {task.assignee?.name?.[0] || 'U'}
          </div>
          <span className="truncate max-w-[120px]">{task.assignee?.name || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
          {task.status === 'COMPLETED' ? (
            <span className="text-emerald-400 font-mono">Score: {latestEvaluation?.rating}/5</span>
          ) : (
            <span>Evaluate</span>
          )}
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
