import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Camera, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataInizio = new Date('2026-03-16');
  const giorniInsieme = Math.floor((new Date().getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Notifica quando arriva un nuovo messaggio
    if (messages.length > 0) {
      setNotification(`${messages[0].sender} ti pensa!`);
      const timerNot = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timerNot);
    }
    return () => clearInterval(timer);
  }, [messages]);

  const compressImage = (dataUrl: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
        else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const sendAction = async (imgData: string | null = null) => {
    await addDoc(collection(db, "messages"), { sender: userName, img: imgData, timestamp: serverTimestamp() });
    setTempImg(null); setShowOptions(false);
  };

  const oggiStr = new Date().toLocaleDateString();
  const messaggiOggi = messages.filter((m: any) => m.timestamp?.toDate().toLocaleDateString() === oggiStr).length;
  const cuoriTizzi = messages.filter((m: any) => m.sender === 'Tizzi').length;
  const cuoriSofia = messages.filter((m: any) => m.sender === 'Sofia').length;

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

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/10 p-3 rounded-2xl text-center"><p className="text-[10px] uppercase opacity-60">Oggi</p><p className="text-xl font-bold">{messaggiOggi}</p></div>
        <div className="bg-white/10 p-3 rounded-2xl text-center"><p className="text-[10px] uppercase opacity-60">Totali</p><p className="text-xl font-bold">{messages.length}</p></div>
        <div className="bg-blue-600/20 p-3 rounded-2xl text-center border border-blue-500/20"><p className="text-[10px] uppercase opacity-70">Tizzi</p><p className="text-xl font-bold">{cuoriTizzi}</p></div>
        <div className="bg-pink-600/20 p-3 rounded-2xl text-center border border-pink-500/20"><p className="text-[10px] uppercase opacity-70">Sofia</p><p className="text-xl font-bold">{cuoriSofia}</p></div>
      </div>

      <div className="flex flex-col items-center mb-8 gap-2 relative">
        <motion.button onClick={() => setShowOptions(!showOptions)} className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-lg">❤️</motion.button>
        <p className="text-xs font-bold opacity-70 uppercase">Premi il cuore</p>
        <AnimatePresence>
          {showOptions && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-16 bg-white/20 backdrop-blur-lg p-3 rounded-2xl flex gap-4 z-50">
              <button onClick={() => sendAction(null)}>Solo Cuore</button>
              <button onClick={() => fileInputRef.current?.click()}><Camera size={16} /> Con Foto</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={async (e) => {
        if (e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = async (ev) => { const compressed = await compressImage(ev.target?.result as string); setTempImg(compressed); };
          reader.readAsDataURL(e.target.files[0]);
        }
      }} />

      <AnimatePresence>
        {tempImg && (
          <motion.div className="fixed inset-0 z-[100] bg-black p-6 flex flex-col justify-center">
            <img src={tempImg} className="w-full rounded-3xl mb-4" />
            <button onClick={() => sendAction(tempImg)} className="bg-red-600 py-4 rounded-2xl font-bold">Invia Foto</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
