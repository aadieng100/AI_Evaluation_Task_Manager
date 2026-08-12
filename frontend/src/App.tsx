import React, { useEffect, useState } from 'react';
import { EvaluationTask, User, CreateTaskInput, CreateEvaluationInput } from './types';
import { fetchTasks, fetchUsers, createTask, assignTask, submitEvaluation } from './services/api';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { TaskCard } from './components/TaskCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { Search, RefreshCw, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<EvaluationTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedTask, setSelectedTask] = useState<EvaluationTask | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedUsers] = await Promise.all([
        fetchTasks(statusFilter === 'ALL' ? undefined : statusFilter),
        fetchUsers(),
      ]);
      setTasks(fetchedTasks);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreateTask = async (input: CreateTaskInput) => {
    await createTask(input);
    await loadData();
  };

  const handleAssignTask = async (taskId: string, assigneeId: string) => {
    const updated = await assignTask(taskId, assigneeId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updated);
    }
  };

  const handleSubmitEvaluation = async (input: CreateEvaluationInput) => {
    await submitEvaluation(input);
    await loadData();
    setSelectedTask(null);
  };

  // Filter tasks locally by search query
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.modelAName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.modelBName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Metrics Overview Bar */}
        <MetricsHeader tasks={tasks} />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto">
            {['ALL', 'PENDING', 'ASSIGNED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {status === 'ALL' ? 'All Tasks' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt or model..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Task Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>

        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-4 font-mono">Fetching evaluation task benchmarks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-card py-16 px-4 rounded-3xl text-center flex flex-col items-center justify-center border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No AI Evaluation Tasks Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              There are no tasks matching the selected filter query. Create a new task benchmark to get started.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
            >
              Create Benchmark Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelectTask={(t) => setSelectedTask(t)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Task Detail & Side-by-Side Model Evaluation Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onAssignTask={handleAssignTask}
          onSubmitEvaluation={handleSubmitEvaluation}
        />
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          users={users}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-400">
        AI Evaluation Task Manager &bull; Built for micro1 Platform Engineering
      </footer>

    </div>
  );
};

export default App;
