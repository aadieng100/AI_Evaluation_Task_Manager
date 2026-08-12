import React, { useState } from 'react';
import { EvaluationTask, User, PreferredOutput, CreateEvaluationInput } from '../types';
import { X, Check, Star, Code, Copy, CheckCircle2, UserPlus, Sparkles, Send } from 'lucide-react';

interface TaskDetailModalProps {
  task: EvaluationTask;
  users: User[];
  onClose: () => void;
  onAssignTask: (taskId: string, assigneeId: string) => Promise<void>;
  onSubmitEvaluation: (input: CreateEvaluationInput) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  users,
  onClose,
  onAssignTask,
  onSubmitEvaluation,
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState(task.assigneeId || users[0]?.id || '');
  const [preferredOutput, setPreferredOutput] = useState<PreferredOutput>('OUTPUT_A');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [copiedModelA, setCopiedModelA] = useState(false);
  const [copiedModelB, setCopiedModelB] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Criteria metrics state
  const [accuracy, setAccuracy] = useState(5);
  const [safety, setSafety] = useState(5);
  const [latencyScore, setLatencyScore] = useState(4);
  const [conciseness, setConciseness] = useState(4);

  const existingEvaluation = task.evaluations?.[0];

  const handleCopy = (text: string, isModelA: boolean) => {
    navigator.clipboard.writeText(text);
    if (isModelA) {
      setCopiedModelA(true);
      setTimeout(() => setCopiedModelA(false), 2000);
    } else {
      setCopiedModelB(true);
      setTimeout(() => setCopiedModelB(false), 2000);
    }
  };

  const handleAssign = async () => {
    if (!selectedAssignee) return;
    await onAssignTask(task.id, selectedAssignee);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      const evaluatorId = task.assigneeId || users[0]?.id || 'usr-1';
      await onSubmitEvaluation({
        taskId: task.id,
        evaluatorId,
        preferredOutput,
        rating,
        feedback,
        metrics: { accuracy, safety, latencyScore, conciseness },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0F1420] border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#131926]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{task.title}</h2>
              <p className="text-xs text-slate-400">ID: <span className="font-mono text-slate-300">{task.id}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Prompt Banner */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Evaluation Prompt
            </h4>
            <p className="text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">{task.prompt}</p>
          </div>

          {/* Assignee Bar (if unassigned or reassigning) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400">Assigned Evaluator:</span>
              <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {task.assignee?.name || 'Unassigned'}
              </span>
            </div>

            {task.status !== 'COMPLETED' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign
                </button>
              </div>
            )}
          </div>

          {/* Side-by-Side Model Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Model A */}
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-indigo-500/20">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
                    <h4 className="font-bold text-indigo-400 text-sm">{task.modelAName}</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(task.modelA, true)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    {copiedModelA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedModelA ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#080C14] border border-slate-800/80 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-72">
                  {task.modelA}
                </pre>
              </div>
            </div>

            {/* Model B */}
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-purple-500/20">
              <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                    <h4 className="font-bold text-purple-400 text-sm">{task.modelBName}</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(task.modelB, false)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    {copiedModelB ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedModelB ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#080C14] border border-slate-800/80 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-72">
                  {task.modelB}
                </pre>
              </div>
            </div>

          </div>

          {/* If Task is COMPLETED: Show Submitted Result Report */}
          {existingEvaluation ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-base font-bold text-white">Evaluation Verified & Completed</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(existingEvaluation.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Winning Model</span>
                  <span className="text-sm font-bold text-indigo-400">{existingEvaluation.preferredOutput}</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Overall Quality Score</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" /> {existingEvaluation.rating} / 5
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Evaluator</span>
                  <span className="text-sm font-semibold text-slate-200">{existingEvaluation.evaluator?.name || 'Expert'}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">Qualitative Feedback:</span>
                {existingEvaluation.feedback}
              </div>
            </div>
          ) : (
            /* Submission Form for AI Evaluator */
            <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-6">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Submit Model Output Evaluation
              </h4>

              {/* Preferred Model Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Preferred Model Output</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferredOutput('OUTPUT_A')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                      preferredOutput === 'OUTPUT_A'
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Model A ({task.modelAName})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredOutput('OUTPUT_B')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                      preferredOutput === 'OUTPUT_B'
                        ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Model B ({task.modelBName})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredOutput('EQUAL')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                      preferredOutput === 'EQUAL'
                        ? 'bg-slate-700 text-white border-slate-500'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    Equal / Tie
                  </button>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Overall Quality Score (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-2 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2 font-mono">{rating} / 5</span>
                </div>
              </div>

              {/* Multi-Criteria Metrics (JSONB) Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Accuracy & Correctness</span>
                    <span className="font-bold text-indigo-400">{accuracy}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={accuracy}
                    onChange={(e) => setAccuracy(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Safety & Alignment</span>
                    <span className="font-bold text-emerald-400">{safety}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={safety}
                    onChange={(e) => setSafety(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Latency & Speed Rating</span>
                    <span className="font-bold text-amber-400">{latencyScore}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={latencyScore}
                    onChange={(e) => setLatencyScore(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Conciseness & Format</span>
                    <span className="font-bold text-purple-400">{conciseness}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={conciseness}
                    onChange={(e) => setConciseness(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Qualitative Assessment Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain why this model output was superior (e.g. edge cases, type safety, hallucination avoidance)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Complete Evaluation'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
