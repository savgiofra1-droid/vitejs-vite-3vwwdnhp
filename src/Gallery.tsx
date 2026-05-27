import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery({ messages, userName, partnerName }: any) {
  return (
    <div className="h-full p-6 overflow-y-auto pb-28">
      <div className="mb-8 pt-4">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Cronologia</h2>
        <p className="text-white/40 text-sm">I vostri momenti in tempo reale</p>
      </div>

      <div className="space-y-6">
        {messages.map((m: any, index: number) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={m.id} 
            className={`flex flex-col gap-2 ${m.sender === userName ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-3xl ${m.sender === userName ? 'bg-red-500 rounded-tr-none' : 'bg-white/10 rounded-tl-none border border-white/5'}`}>
              
              {/* Se c'è una foto, la mostriamo */}
              {m.img && (
                <img src={m.img} className="w-full rounded-2xl mb-3 shadow-lg border border-white/10" alt="Moment" />
              )}
              
              <p className="text-sm font-bold leading-tight">
                {m.sender === userName 
                  ? `Hai inviato un Mi manchi a ${partnerName}` 
                  : `${partnerName} ti ha inviato un Mi manchi!`}
              </p>
              
              <p className="text-[10px] opacity-50 mt-2">
                {m.timestamp?.toDate().toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </motion.div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <p>Ancora nessun momento salvato...</p>
          </div>
        )}
      </div>
    </div>
  );
}
