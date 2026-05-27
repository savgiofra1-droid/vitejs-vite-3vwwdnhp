import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Camera, X, RefreshCw } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const giorniInsieme = Math.floor((new Date().getTime() - new Date('2026-03-16').getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (messages.length > 0) {
      setNotification(`${messages[0].sender} ti pensa!`);
      const t = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(t);
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
        let width = img.width, height = img.height;
        if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
        else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
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

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto pb-24 text-white">
      <button onClick={() => window.location.reload()} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full z-50">
        <RefreshCw size={16} />
      </button>

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
        <div className="bg-white/10 p-3 rounded-2xl text-center"><p className="text-[10px] uppercase">Oggi</p><p className="text-xl font-bold">{messaggiOggi}</p></div>
        <div className="bg-white/10 p-3 rounded-2xl text-center"><p className="text-[10px] uppercase">Totali</p><p className="text-xl font-bold">{messages.length}</p></div>
      </div>

      <div className="flex flex-col items-center mb-8 gap-2 relative">
        <motion.button onClick={() => setShowOptions(!showOptions)} className="w-32 h-32 bg-red-600 rounded-full shadow-lg text-5xl">❤️</motion.button>
        <AnimatePresence>
          {showOptions && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-16 bg-white/20 backdrop-blur-lg p-3 rounded-2xl flex gap-4 z-50">
              <button onClick={() => sendAction(null)} className="text-sm font-bold">Solo Cuore</button>
              <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold"><Camera size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={async (e) => {
        if (e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = async (ev) => setTempImg(await compressImage(ev.target?.result as string));
          reader.readAsDataURL(e.target.files[0]);
        }
      }} />

      <div className="space-y-3">
        <h3 className="text-xs font-bold opacity-50 uppercase px-2">Attività live</h3>
        {messages.slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-black/40 p-3 rounded-xl border border-white/10 text-sm flex justify-between">
            <span>{m.sender} ha inviato un pensiero</span>
            <span className="opacity-50">{m.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
