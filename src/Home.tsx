import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Camera, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, partnerName, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataInizio = new Date('2025-03-16');
  const giorniInsieme = Math.floor((new Date().getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (messages.length > 0) {
      setNotification(`${messages[0].sender} ti pensa!`);
      const timerNot = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timerNot);
    }
    return () => clearInterval(timer);
  }, [messages]);

  // FUNZIONE DI INVIO CORRETTA E FORZATA
  const sendAction = async (imgData: string | null = null) => {
    try {
      await addDoc(collection(db, "messages"), { 
        sender: userName, 
        img: imgData, // Se è null, salva null (solo cuore)
        timestamp: serverTimestamp() 
      });
      // Resetta tutto dopo l'invio
      setTempImg(null);
      setShowOptions(false);
    } catch (error) {
      console.error("Errore nell'invio:", error);
      alert("Errore nell'invio, riprova!");
    }
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

      <div className="flex flex-col items-center mb-8 gap-2 relative">
        <motion.button onClick={() => setShowOptions(!showOptions)} className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-5xl">❤️</span>
        </motion.button>
        <p className="text-xs font-bold opacity-70 tracking-widest uppercase mt-2">Premi il cuore</p>
        
        <AnimatePresence>
          {showOptions && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-16 bg-white/20 backdrop-blur-lg p-3 rounded-2xl flex gap-4 shadow-xl z-40">
              <button onClick={() => sendAction(null)} className="text-sm font-bold px-2">Solo Cuore</button>
              <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold flex items-center gap-1 px-2">
                <Camera size={16} /> Con Foto
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => setTempImg(event.target?.result as string);
          reader.readAsDataURL(file);
        }
      }} />

      <div className="space-y-3">
        <h3 className="text-xs font-bold opacity-50 uppercase px-2">Ultimi messaggi</h3>
        {messages.slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-sm flex justify-between">
            <p className="font-bold">{m.sender} ti ha pensato</p>
            <span className="opacity-50">{m.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {tempImg && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed inset-0 z-50 bg-black p-6 flex flex-col justify-center">
            <img src={tempImg} className="w-full rounded-3xl mb-4" />
            <div className="flex gap-4">
              <button onClick={() => setTempImg(null)} className="flex-1 bg-white/10 py-4 rounded-2xl"><X className="mx-auto"/></button>
              <button onClick={() => sendAction(tempImg)} className="flex-[2] bg-red-600 py-4 rounded-2xl font-bold">Invia</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
