import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, partnerName, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [tempImg, setTempImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calcolo giorni insieme
  const dataInizio = new Date('2025-03-16');
  const giorniInsieme = Math.floor((new Date().getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sendHeart = async (withImg: boolean = false) => {
    await addDoc(collection(db, "messages"), {
      sender: userName,
      img: withImg ? tempImg : null,
      timestamp: serverTimestamp()
    });
    setTempImg(null);
    // Notifica
    if (Notification.permission === 'granted') {
      new Notification("Nuovo Mi manchi!", { body: `${userName} ti sta pensando!` });
    }
  };

  const messaggiOggi = messages.filter((m: any) => m.timestamp?.toDate().toLocaleDateString() === new Date().toLocaleDateString()).length;

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto pb-24">
      <div className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 w-full text-center mb-4">
        <h1 className="text-4xl font-bold">{time.toLocaleTimeString()}</h1>
        <p className="text-red-400 font-bold text-sm tracking-widest mt-1">{giorniInsieme} giorni insieme</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-red-500/20 p-3 rounded-2xl border border-red-500/20 text-center">
          <p className="text-[10px] uppercase opacity-60">Oggi</p>
          <p className="text-xl font-bold text-red-400">{messaggiOggi}</p>
        </div>
        <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
          <p className="text-[10px] uppercase opacity-60">Totali</p>
          <p className="text-xl font-bold">{messages.length}</p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <h2 className="text-xl font-bold mb-4">Ciao {userName}, pensi a {partnerName}?</h2>
        <div className="relative">
          <motion.button onClick={() => sendHeart(false)} whileTap={{ scale: 0.9 }} className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)]">
            <span className="text-5xl">❤️</span>
          </motion.button>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white text-black p-3 rounded-full"><Camera size={20} /></button>
        </div>
      </div>

      <div className="space-y-3">
        {messages.slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm flex justify-between items-center">
            <p className="font-bold">{m.sender === userName ? `Hai inviato a ${partnerName}` : `${partnerName} ha inviato a te`}</p>
            <span className="text-[10px] text-white/30">{m.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {tempImg && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed inset-0 z-50 bg-black/95 p-6 flex flex-col justify-center">
            <img src={tempImg} className="w-full h-auto rounded-3xl mb-4" />
            <button onClick={() => sendHeart(true)} className="bg-red-500 py-4 rounded-2xl font-bold">Invia Foto</button>
          </motion.div>
        )}
      </AnimatePresence>
      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
        const reader = new FileReader();
        reader.onloadend = () => setTempImg(reader.result as string);
        reader.readAsDataURL(e.target.files![0]);
      }} />
    </div>
  );
}
