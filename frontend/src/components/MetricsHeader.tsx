import React from 'react';
import { EvaluationTask } from '../types';
import { Layers, Clock, CheckCircle2, Award } from 'lucide-react';

interface MetricsHeaderProps {
  tasks: EvaluationTask[];
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'ASSIGNED').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  
  // Calculate average rating of completed evaluations
  const ratings = tasks
    .flatMap((t) => t.evaluations || [])
    .map((e) => e.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Total Tasks */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Benchmarks</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalTasks}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">Active evaluation dataset</div>
      </div>

      {/* Pending / Assigned */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">In Progress / Pending</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingTasks}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">Awaiting expert review</div>
      </div>

      {/* Completed */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Completed Evaluations</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{completedTasks}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">Verified model outputs</div>
      </div>

      {/* Avg Quality Score */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Avg Model Score</p>
            <h3 className="text-2xl font-bold text-purple-400 mt-1">{avgRating} <span className="text-xs text-slate-500">/ 5.0</span></h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">Overall response quality rating</div>
      </div>

    </div>
  );
};
