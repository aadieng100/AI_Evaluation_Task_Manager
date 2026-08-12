import React, { useState } from 'react';
import { User, CreateTaskInput } from '../types';
import { X, Plus, Cpu } from 'lucide-react';

interface CreateTaskModalProps {
  users: User[];
  onClose: () => void;
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  users,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [modelAName, setModelAName] = useState('Claude 3.5 Sonnet');
  const [modelBName, setModelBName] = useState('GPT-4o');
  const [modelA, setModelA] = useState('');
  const [modelB, setModelB] = useState('');
  const [priority, setPriority] = useState(3);
  const [assigneeId, setAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !prompt || !modelA || !modelB) return;
    setIsSubmitting(true);
    try {
      await onCreateTask({
        title,
        prompt,
        modelA,
        modelB,
        modelAName,
        modelBName,
        priority,
        assigneeId: assigneeId || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0F1420] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#131926]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create AI Evaluation Task</h2>
              <p className="text-xs text-slate-400">Add a new model benchmark task to the internal platform queue</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Benchmark Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Python Async Memory Leak Fix"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">AI Prompt</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt passed to the LLMs..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Model Names & Outputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Model A */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-400 block">Model A Name</label>
              <input
                type="text"
                value={modelAName}
                onChange={(e) => setModelAName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <label className="text-xs font-semibold text-slate-400 block">Model A Output</label>
              <textarea
                rows={5}
                value={modelA}
                onChange={(e) => setModelA(e.target.value)}
                placeholder="Paste Model A output..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Model B */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-400 block">Model B Name</label>
              <input
                type="text"
                value={modelBName}
                onChange={(e) => setModelBName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <label className="text-xs font-semibold text-slate-400 block">Model B Output</label>
              <textarea
                rows={5}
                value={modelB}
                onChange={(e) => setModelB(e.target.value)}
                placeholder="Paste Model B output..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>

          </div>

          {/* Priority & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Level (1-5)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>P1 - Low Priority</option>
                <option value={2}>P2 - Normal Priority</option>
                <option value={3}>P3 - Medium Priority</option>
                <option value={4}>P4 - High Priority</option>
                <option value={5}>P5 - Critical Benchmark</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Assign Evaluator (Optional)</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Leave Unassigned (Pending)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
