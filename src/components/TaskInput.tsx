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
      <div className="absolute -top-3 left-0">
        <span className="text-[8px] uppercase tracking-[0.4em] text-emerald-500/40 font-bold font-mono">Input_Capture</span>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Awaiting Command..."
        className="bg-transparent border-b-2 border-white/5 w-full py-6 text-2xl font-light focus:outline-none focus:border-emerald-500/30 transition-all placeholder:opacity-20 font-serif text-gray-100 selection:bg-emerald-500/30"
      />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
        <span className="text-[10px] text-white/10 uppercase font-mono tracking-[0.2em] hidden sm:inline">RTN TO CMIT</span>
      </div>
    </form>
  );
}
