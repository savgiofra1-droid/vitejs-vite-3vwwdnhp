import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function Gallery({ messages }: any) {
  return (
    <div className="p-4 grid grid-cols-2 gap-4 pb-24">
      {messages.filter((m: any) => m.img).map((m: any) => (
        <motion.div key={m.id} className="relative group">
          <img src={m.img} className="w-full h-40 object-cover rounded-2xl border" />
          <button onClick={() => deleteDoc(doc(db, "messages", m.id))} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full"><Trash2 size={14} color="red" /></button>
        </motion.div>
      ))}
    </div>
  );
}
