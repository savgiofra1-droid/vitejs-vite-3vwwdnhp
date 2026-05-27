import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery({ messages }: any) {
  return (
    <div className="p-4 grid grid-cols-2 gap-4 pb-24">
      {messages.filter((m: any) => m.img).map((m: any) => (
        <motion.img 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          key={m.id} 
          src={m.img} 
          className="w-full h-40 object-cover rounded-2xl border border-white/10 shadow-lg" 
        />
      ))}
    </div>
  );
}
