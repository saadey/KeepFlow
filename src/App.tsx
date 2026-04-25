import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/firebase';
import { taskService } from './services/taskService';
import { Task } from './types';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';
import { LogIn, LogOut, Loader2, Sparkles, AlertCircle, Trash2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showBin, setShowBin] = useState(false);

  useEffect(() => {
    const effectiveUserId = user?.uid || 'local-user';
    setIsSyncing(true);
    const unsubscribe = taskService.subscribeTasks(effectiveUserId, (fetchedTasks) => {
      setTasks(fetchedTasks);
      setIsSyncing(false);
    });
    return () => unsubscribe();
  }, [user]);

  const addTask = async (title: string) => {
    const effectiveUserId = user?.uid || 'local-user';
    await taskService.addTask(effectiveUserId, title);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await taskService.updateTask(id, updates);
  };

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  const allActiveTasks = tasks.filter(t => !t.isDeleted);
  const currentTasks = allActiveTasks.filter(t => !t.isCompleted);
  const completedTasks = allActiveTasks.filter(t => t.isCompleted);
  const binnedTasks = tasks.filter(t => t.isDeleted);

  const importantCount = allActiveTasks.filter(t => t.priority === 'important' && !t.isCompleted).length;
  const completedCount = completedTasks.length;
  const activeCount = currentTasks.length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-emerald-500/30 flex flex-col">
      <header className="p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-center border-b border-white/5 gap-4 sm:gap-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-sm bg-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Terminal className="text-white" size={16} />
                </div>
                <h1 className="text-xl font-medium tracking-[0.2em] uppercase italic font-serif">KeepFlow</h1>
              </div>
          
          <button 
            onClick={() => setShowBin(!showBin)}
            className={`sm:hidden text-[10px] uppercase tracking-widest px-3 py-1 rounded border transition-all ${showBin ? 'border-emerald-500 text-emerald-500' : 'border-white/10 text-white/40'}`}
          >
            {showBin ? 'ACTIVE' : `BIN [${binnedTasks.length}]`}
          </button>
        </div>

        <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.1em] opacity-40 font-mono hidden lg:flex">
          <div className="flex flex-col items-center">
            <span className="text-emerald-500">{activeCount}</span>
            <span>Active</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col items-center">
            <span>{completedCount}</span>
            <span>Done</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-emerald-400">{importantCount}</span>
            <span>Urgent</span>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
          <button 
            onClick={() => setShowBin(!showBin)}
            className={`hidden sm:block text-[10px] uppercase tracking-[0.2em] font-mono transition-all ${showBin ? 'text-emerald-500 opacity-100' : 'text-white opacity-20 hover:opacity-100'}`}
          >
            {showBin ? 'VIEW ACTIVE' : `RECYCLE_BIN [${binnedTasks.length}]`}
          </button>
          
          {!user ? (
            <button onClick={login} className="text-[10px] uppercase tracking-widest px-4 py-2 border border-white/10 rounded hover:border-emerald-500 hover:text-emerald-500 transition-all">Sign In</button>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 p-1 pr-3 rounded-full border border-white/5">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-white/10" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase tracking-tighter text-white/60 font-bold truncate max-w-[80px]">{user.displayName?.split(' ')[0]}</span>
                <button onClick={logout} className="text-[8px] uppercase tracking-widest text-[#555] hover:text-emerald-500 transition-colors">Logout</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 flex flex-col space-y-12 w-full">
        {!showBin ? (
          <>
            <section className="w-full">
              <TaskInput onAdd={addTask} />
            </section>

            <div className="flex flex-col space-y-12">
              {/* CURRENT PROCESSES */}
              <section className="flex flex-col space-y-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] font-mono">Active_Processes</h3>
                    {isSyncing && <Loader2 className="animate-spin text-emerald-500/30" size={12} />}
                  </div>
                </div>

                {currentTasks.length === 0 ? (
                  <div className="text-center py-12 opacity-20 italic font-serif text-lg px-12 leading-relaxed">
                    "All buffers cleared."
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {currentTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          layout
                        >
                          <TaskItem 
                            task={task} 
                            onUpdate={updateTask} 
                            onDelete={deleteTask} 
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>

              {/* TERMINATED PROCESSES (Completed) */}
              {completedTasks.length > 0 && (
                <section className="flex flex-col space-y-4 pt-12 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] font-mono">Terminated_Processes</h3>
                    </div>
                    <button 
                      onClick={() => {
                        completedTasks.forEach(t => updateTask(t.id, { isDeleted: true }));
                      }}
                      className="text-[9px] uppercase tracking-[0.2em] text-white/10 hover:text-emerald-500 transition-colors bg-white/5 px-3 py-1 rounded-sm border border-white/5"
                    >
                      Archive_All
                    </button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {completedTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <TaskItem 
                            task={task} 
                            onUpdate={updateTask} 
                            onDelete={deleteTask} 
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </div>
          </>
        ) : (

          <section className="flex flex-col space-y-4">
            <div className="flex items-center justify-between mb-4 px-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <Trash2 size={16} />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Recycle_Bin</h3>
              </div>
              <button 
                onClick={() => {
                  binnedTasks.forEach(t => deleteTask(t.id));
                }}
                className="text-[9px] uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 transition-colors bg-red-950/5 px-3 py-1 rounded-sm border border-red-900/10"
              >
                Clear Everything
              </button>
            </div>

            {binnedTasks.length === 0 ? (
              <div className="text-center py-24 opacity-20 italic font-serif text-xl px-12 leading-relaxed">
                "The void is clean."
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {binnedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      layout
                    >
                      <TaskItem 
                        task={task} 
                        onUpdate={updateTask} 
                        onDelete={deleteTask} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="p-8 flex justify-center mt-auto border-t border-white/5 bg-[#050505]">
        <div className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-medium text-center font-mono">
          {user ? `SECURE_SESSION: ${user.email?.toUpperCase()}` : 'LOCAL_SAFE_ACTIVE'} • KeepFlow v1.0.6
        </div>
      </footer>
    </div>
  );
}
