import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, partnerName, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [notification, setNotification] = useState<string | null>(null);

  const dataInizio = new Date('2025-03-16');
  const giorniInsieme = Math.floor((new Date().getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (messages.length > 0) {
      setNotification(`${messages[0].sender} ha inviato un pensiero!`);
      const timerNotifica = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timerNotifica);
    }
    return () => clearInterval(timer);
  }, [messages]);

  const sendHeart = async () => {
    await addDoc(collection(db, "messages"), { 
      sender: userName, 
      timestamp: serverTimestamp() 
    });
  };

  const oggiStr = new Date().toLocaleDateString();
  const messaggiOggi = messages.filter((m: any) => m.timestamp?.toDate().toLocaleDateString() === oggiStr).length;

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto pb-24 text-white">
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }} className="bg-red-500 p-3 rounded-2xl mb-4 flex items-center gap-2 shadow-lg z-50">
            <Bell size={16} /> <p className="text-sm font-bold">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center mb-6">
        <h1 className="text-4xl font-bold">{time.toLocaleTimeString()}</h1>
        <p className="text-red-400 text-sm font-bold mt-1">{giorniInsieme} giorni insieme</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
          <p className="text-[10px] uppercase opacity-60">Oggi</p>
          <p className="text-xl font-bold">{messaggiOggi}</p>
        </div>
        <div className="flex-1 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
          <p className="text-[10px] uppercase opacity-60">Totali</p>
          <p className="text-xl font-bold">{messages.length}</p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <h2 className="text-xl font-bold mb-4">{userName === 'Tizzi' ? 'Ciao Tizzi, pensi a Sofia?' : 'Sofia, pensi a Tizzi?'}</h2>
        <motion.button 
          onClick={sendHeart}
          whileTap={{ scale: 0.9 }} 
          className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)]"
        >
          <span className="text-5xl">❤️</span>
        </motion.button>
      </div>

      <div className="space-y-3">
        {messages.slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-sm flex justify-between">
            <p className="font-bold">{m.sender} ti ha pensato</p>
          </div>
        ))}
      </div>
    </div>
  );
}
