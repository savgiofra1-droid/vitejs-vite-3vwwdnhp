import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Send, Bell, Heart, Smile, Star } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, partnerName, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [showReactions, setShowReactions] = useState(false);
  const [tempImg, setTempImg] = useState<string | null>(null);

  // Modalità Notte
  const isNight = time.getHours() >= 22 || time.getHours() < 6;

  const sendAction = async (type: string, content: string | null = null) => {
    await addDoc(collection(db, "messages"), { 
      sender: userName, 
      type: type, 
      img: content, 
      timestamp: serverTimestamp() 
    });
    setShowReactions(false);
    setTempImg(null);
  };

  return (
    <div className={`flex flex-col h-full p-4 overflow-y-auto pb-24 ${isNight ? 'bg-indigo-950/30' : 'bg-transparent'}`}>
      
      {/* Modalità Notte UI */}
      {isNight && (
        <div className="text-center py-2 text-indigo-300 italic text-xs animate-pulse">🌙 Modalità notte attiva</div>
      )}

      {/* Pulsante Cuore con Reaction Popup */}
      <div className="flex flex-col items-center mb-8 relative">
        <motion.button 
          onLongPress={() => setShowReactions(true)} // Se usi una libreria gesture
          onClick={() => setShowReactions(!showReactions)}
          className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)]"
        >
          <span className="text-5xl">❤️</span>
        </motion.button>

        {/* Reaction Bar */}
        <AnimatePresence>
          {showReactions && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -20 }} className="absolute -top-16 bg-white/10 backdrop-blur-lg p-3 rounded-full flex gap-4">
              <button onClick={() => sendAction('kiss', '💋')}>💋</button>
              <button onClick={() => sendAction('hug', '🫂')}>🫂</button>
              <button onClick={() => sendAction('star', '🌟')}>🌟</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feed notifiche con badge simbolico */}
      <div className="space-y-3">
        {messages.slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm flex justify-between items-center">
            <p className="font-bold">
              {m.type === 'kiss' ? `${m.sender} ti manda un bacio!` : 
               m.type === 'hug' ? `${m.sender} ti abbraccia!` : 
               `${m.sender} ti pensa!`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
