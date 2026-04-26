import React, { useState } from 'react';
import { motion, PanInfo, useAnimation, AnimatePresence } from 'motion/react';
import { Check, Trash2, Info, ChevronRight, Star } from 'lucide-react';
import { formatTaskDate } from '../lib/formatters';
import { Clock, Terminal, Activity, CheckCircle2 } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localDesc, setLocalDesc] = useState(task.description);
  const controls = useAnimation();

  // Sync local description when task changes (e.g. from server)
  React.useEffect(() => {
    setLocalDesc(task.description);
  }, [task.description]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Swipe right (positive x) -> Complete
    if (info.offset.x > 80) {
      if (task.isDeleted) {
        onUpdate(task.id, { isDeleted: false }); // Restore
      } else {
        const isNowCompleted = !task.isCompleted;
        onUpdate(task.id, { 
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? Date.now() : undefined
        });
      }
    }
    // Swipe left (negative x) -> Delete to Bin (or hard delete if already in bin)
    if (info.offset.x < -100) {
      if (task.isDeleted) {
        onDelete(task.id); 
      } else {
        onUpdate(task.id, { isDeleted: true });
      }
    }
    controls.start({ x: 0 });
  };

  const togglePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPriority = task.priority === Priority.IMPORTANT ? Priority.NONE : Priority.IMPORTANT;
    onUpdate(task.id, { priority: nextPriority });
  };

  const handleDescBlur = () => {
    if (localDesc !== task.description) {
      onUpdate(task.id, { description: localDesc });
    }
  };

  return (
    <div className="relative mb-6 group overflow-hidden rounded-xl bg-[#0D0D0D] border border-white/5 h-auto transition-all hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]">
      {/* Background Actions - Only visible during drag */}
      <motion.div 
        style={{ opacity: 0 }}
        whileDrag={{ opacity: 1 }}
        className="absolute top-0 left-0 right-0 h-[68px] flex items-center justify-between px-6 pointer-events-none"
      >
        <div className="flex items-center text-emerald-500 font-bold text-[10px] tracking-widest uppercase italic">
          <Check size={18} className="mr-2" />
          {task.isDeleted ? 'RECOVER' : (task.isCompleted ? 'RESTORE' : 'DONE')}
        </div>
        <div className="flex items-center text-red-500 font-bold text-[10px] tracking-widest uppercase italic">
          <Trash2 size={18} className="mr-2" />
          {task.isDeleted ? 'DELETE_PERMANENTLY' : 'TO_BIN'}
        </div>
      </motion.div>

      {/* Main Task Body */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative z-10 flex flex-col bg-[#0D0D0D] border border-white/5 rounded-xl transition-all cursor-pointer select-none ${
          task.priority === Priority.IMPORTANT ? 'border-l-emerald-600/50 shadow-[0_0_25px_rgba(16,185,129,0.08)]' : 'border-l-white/10'
        } border-l-[3px] ${task.isCompleted ? 'opacity-70 grayscale-[10%]' : 'hover:bg-[#111] hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]'}`}
      >
        <div className="flex items-center">
          <div className="p-5 border-r border-white/5 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (task.isDeleted) {
                   onUpdate(task.id, { isDeleted: false });
                } else {
                   const isNowCompleted = !task.isCompleted;
                   onUpdate(task.id, { 
                     isCompleted: isNowCompleted,
                     completedAt: isNowCompleted ? Date.now() : undefined
                   });
                }
              }}
              className={`w-6 h-6 border rounded-sm flex items-center justify-center transition-all ${
                task.isCompleted 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-110' 
                  : 'border-white/20 text-transparent hover:border-emerald-500/50'
              }`}
            >
              {task.isCompleted && <Check size={14} strokeWidth={3} />}
            </button>
          </div>

          <div className="flex-1 p-5 min-w-0">
            <div className="flex flex-col">
              <span className={`text-lg transition-all block truncate font-sans tracking-tight ${
                task.isCompleted ? 'text-gray-400 line-through decoration-emerald-500/30' : 'text-gray-100'
              } ${task.priority === Priority.IMPORTANT && !task.isCompleted ? 'text-emerald-300 font-medium' : ''}`}>
                {task.title}
              </span>
              {task.isCompleted && task.completedAt && (
                <span className="text-[8px] uppercase tracking-[0.1em] text-emerald-500 font-mono mt-1 font-bold">
                  EXEC_COMPLETED: {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 px-5 opacity-40 group-hover:opacity-100 transition-opacity">
            {!task.isDeleted && (
              <button
                onClick={togglePriority}
                className={`p-1.5 border rounded-sm transition-all ${
                  task.priority === Priority.IMPORTANT 
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'border-white/10 bg-white/5 text-white/10 hover:text-white/40'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${task.priority === Priority.IMPORTANT ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-current'}`} />
              </button>
            )}
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold hidden sm:inline font-mono">
              {isExpanded ? 'COLLAPSE' : 'DETAILS'}
            </span>
          </div>
        </div>

        {/* Hidden Description Revealed Underneath */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#050505] border-t border-white/5 px-8 py-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-500/40 font-mono">
                    <Terminal size={12} />
                    <span>Internal_Notes</span>
                  </div>
                    <textarea
                    value={localDesc}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => setLocalDesc(e.target.value)}
                    onBlur={handleDescBlur}
                    placeholder="// Awaiting input details..."
                    className="w-full bg-transparent text-sm text-gray-200 leading-relaxed font-mono focus:outline-none resize-none min-h-[80px] border-none p-0 selection:bg-emerald-500/30 placeholder:opacity-30"
                  />
                </div>

                <div className="flex flex-col gap-4 min-w-[200px] border-l border-white/5 pl-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/20 font-mono">
                      <Clock size={10} />
                      <span>Timestamp_Init</span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {formatTaskDate(task.createdAt)}
                    </div>
                  </div>

                  {task.isCompleted && task.completedAt && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-emerald-500/30 font-mono">
                        <CheckCircle2 size={10} />
                        <span>Execution_Success</span>
                      </div>
                      <div className="text-[10px] text-emerald-500/40 font-mono">
                        {formatTaskDate(task.completedAt)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/20 font-mono">
                      <Activity size={10} />
                      <span>Process_Id</span>
                    </div>
                    <div className="text-[10px] text-white/30 font-mono truncate max-w-[150px]">
                      {task.id.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
