import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/firebase';
import { taskService } from './services/taskService';
import { Task } from './types';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';
import { LogIn, LogOut, Loader2, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
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

  const activeTasks = tasks.filter(t => !t.isDeleted);
  const binnedTasks = tasks.filter(t => t.isDeleted);

  const importantCount = activeTasks.filter(t => t.priority === 'important' && !t.isCompleted).length;
  const completedCount = activeTasks.filter(t => t.isCompleted).length;
  const activeCount = activeTasks.length - completedCount;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-red-500/30 flex flex-col">
      <header className="p-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <Sparkles className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-medium tracking-widest uppercase italic font-serif">KeepFlow</h1>
        </div>
        <div className="flex items-center space-x-6 text-[10px] uppercase tracking-tighter opacity-40 font-semibold hidden md:flex">
          <span>{activeCount} Active</span>
          <span>{completedCount} Completed</span>
          <span className="text-red-500">{importantCount} Urgent</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowBin(!showBin)}
            className={`text-[10px] uppercase tracking-widest transition-all ${showBin ? 'text-red-500 opacity-100' : 'text-white opacity-20 hover:opacity-100'}`}
          >
            {showBin ? 'Close Bin' : `Bin (${binnedTasks.length})`}
          </button>
          {!user ? (
            <button onClick={login} className="text-[10px] uppercase tracking-widest text-[#555] hover:text-white transition-colors">Sign In</button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{user.displayName}</span>
                <button onClick={logout} className="text-[9px] uppercase tracking-widest text-[#555] hover:text-red-500 transition-colors">Sign Out</button>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/40">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <button onClick={logout} className="sm:hidden text-[10px] uppercase tracking-widest text-[#555] hover:text-white transition-colors">Sign Out</button>
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

            <section className="flex flex-col space-y-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">The Current Flow</h3>
                  {isSyncing && <Loader2 className="animate-spin text-white/10" size={12} />}
                </div>
                {activeTasks.some(t => t.isCompleted) && (
                  <button 
                    onClick={() => {
                      activeTasks.filter(t => t.isCompleted).forEach(t => updateTask(t.id, { isDeleted: true }));
                    }}
                    className="text-[10px] uppercase tracking-widest text-white/10 hover:text-red-500 transition-colors"
                  >
                    Archive Completed
                  </button>
                )}
              </div>

              {activeTasks.length === 0 ? (
                <div className="text-center py-24 opacity-20 italic font-serif text-xl px-12 leading-relaxed">
                  "Silence is the canvas of the busy mind."
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {activeTasks.map((task) => (
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
          </>
        ) : (
          <section className="flex flex-col space-y-4">
            <div className="flex items-center justify-between mb-4 px-2 border-b border-red-500/10 pb-4">
              <div className="flex items-center gap-3 text-red-500">
                <Trash2 size={16} />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Recycle Bin</h3>
              </div>
              <button 
                onClick={() => {
                  binnedTasks.forEach(t => deleteTask(t.id));
                }}
                className="text-[10px] uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
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
        <div className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-medium text-center">
          {user ? `Authenticated Session: ${user.email}` : 'Local Safe Active'} • KeepFlow v1.0.5
        </div>
      </footer>
    </div>
  );
}
