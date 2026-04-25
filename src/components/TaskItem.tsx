import React, { useState } from 'react';
import { motion, PanInfo, useAnimation, AnimatePresence } from 'motion/react';
import { Check, Trash2, Info, ChevronRight, Star } from 'lucide-react';
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
        onUpdate(task.id, { isCompleted: !task.isCompleted });
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
    <div className="relative mb-4 group overflow-hidden rounded-lg bg-[#111] border border-white/5 h-auto transition-all">
      {/* Background Actions - Fixed height and locked behind header */}
      <div className="absolute top-0 left-0 right-0 h-[68px] flex items-center justify-between px-6 pointer-events-none opacity-40">
        <div className="flex items-center text-white font-bold text-[10px] tracking-widest uppercase italic">
          <Check size={18} className="mr-2" />
          {task.isDeleted ? 'RECOVER' : (task.isCompleted ? 'RESTORE' : 'DONE')}
        </div>
        <div className="flex items-center text-red-500 font-bold text-[10px] tracking-widest uppercase italic border-red-500/20">
          <Trash2 size={18} className="mr-2" />
          {task.isDeleted ? 'DELETE FOR GOOD' : 'TO BIN'}
        </div>
      </div>

      {/* Main Task Body */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative z-10 flex flex-col bg-[#111] border border-white/5 rounded-lg transition-all cursor-pointer select-none ${
          task.priority === Priority.IMPORTANT ? 'border-l-red-600/50 border-white/10' : ''
        } ${task.isCompleted ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center">
          <div className={`p-5 border-r border-white/5 flex items-center justify-center ${task.priority === Priority.IMPORTANT ? 'border-red-900/20' : ''}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (task.isDeleted) {
                   onUpdate(task.id, { isDeleted: false });
                } else {
                   onUpdate(task.id, { isCompleted: !task.isCompleted });
                }
              }}
              className={`w-6 h-6 border rounded flex items-center justify-center transition-all ${
                task.isCompleted 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : task.priority === Priority.IMPORTANT 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-white/20 hover:border-white/40'
              }`}
            >
              {task.isCompleted && <Check size={14} strokeWidth={4} />}
              {!task.isCompleted && task.priority === Priority.IMPORTANT && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
            </button>
          </div>

          <div className="flex-1 p-5 min-w-0">
            <span className={`text-lg transition-all block truncate ${
              task.isCompleted ? 'text-gray-500 line-through opacity-50' : 'text-gray-200'
            } ${task.priority === Priority.IMPORTANT && !task.isCompleted ? 'text-red-200 font-medium' : ''}`}>
              {task.title}
            </span>
          </div>

          <div className="flex items-center space-x-2 px-5 opacity-40 group-hover:opacity-100 transition-opacity">
            {!task.isDeleted && (
              <button
                onClick={togglePriority}
                className={`p-1 transition-all ${
                  task.priority === Priority.IMPORTANT ? 'text-red-500 hover:text-red-400' : 'text-white/10 hover:text-white/40'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${task.priority === Priority.IMPORTANT ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-current'}`} />
              </button>
            )}
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold hidden sm:inline">
              {isExpanded ? 'Collapse' : 'Details'}
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
              className="bg-[#050505] border-t border-white/5 px-8 py-6 space-y-3"
            >
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold italic">Internal Notes</span>
              <textarea
                value={localDesc}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => setLocalDesc(e.target.value)}
                onBlur={handleDescBlur}
                placeholder="The details belong here..."
                className="w-full bg-transparent text-sm text-gray-400 leading-relaxed italic focus:outline-none resize-none min-h-[100px] border-none p-0"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
