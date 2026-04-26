import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskInputProps {
  onAdd: (title: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
      <div className="absolute -top-4 left-0 flex items-center gap-2">
        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.4em] text-emerald-500/60 font-bold font-mono">Input_Capture_System</span>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Awaiting Command..."
        className="bg-white/[0.02] border-b-2 border-white/5 w-full py-8 px-6 text-2xl font-light focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] focus:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)] transition-all placeholder:opacity-30 rounded-t-xl font-serif text-gray-100 selection:bg-emerald-500/30"
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-4">
        <span className="text-[10px] text-white/20 uppercase font-mono tracking-[0.2em] hidden sm:inline border border-white/10 px-2 py-1 rounded">RTN_TO_CMIT</span>
      </div>
    </form>
  );
}
