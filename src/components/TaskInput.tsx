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
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Just start typing..."
        className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-light focus:outline-none focus:border-white/30 transition-colors placeholder:opacity-20 font-serif text-gray-100"
      />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
        <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest hidden sm:inline">Enter to add</span>
      </div>
    </form>
  );
}
