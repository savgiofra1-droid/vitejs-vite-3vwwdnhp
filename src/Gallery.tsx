import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery({ messages }: any) {
  return (
    <div className="p-4 grid grid-cols-2 gap-4 pb-24">
      {messages.filter((m: any) => m.img && m.img.length > 10).map((m: any) => (
        <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <img src={m.img} className="w-full h-40 object-cover rounded-2xl border border-white/10" />
          <p className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 rounded">
            {m.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
