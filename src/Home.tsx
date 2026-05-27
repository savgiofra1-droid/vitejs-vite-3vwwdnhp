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

  const giorniInsieme = Math.floor((new Date().getTime() - new Date('2025-03-16').getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (messages.length > 0) {
      setNotification(`${messages[0].sender} ti pensa!`);
      const timerNot = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timerNot);
    }
    return () => clearInterval(timer);
  }, [messages]);

  // Funzione con Geolocalizzazione per i ricordi
  const sendAction = async (imgData: string | null = null) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await addDoc(collection(db, "messages"), { 
            sender: userName, 
            img: imgData, 
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp() 
          });
          setTempImg(null); setShowOptions(false);
        },
        async () => {
          // Se rifiuta la posizione, invia senza coordinate
          await addDoc(collection(db, "messages"), { sender: userName, img: imgData, timestamp: serverTimestamp() });
          setTempImg(null); setShowOptions(false);
        }
      );
    } else {
      await addDoc(collection(db, "messages"), { sender: userName, img: imgData, timestamp: serverTimestamp() });
      setTempImg(null); setShowOptions(false);
    }
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

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setTempImg(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      }} />

      <div className="space-y-3">
        {messages.slice(0, 5).map((m: any) => (
          <div key={m.id} className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-sm flex justify-between">
            <p className="font-bold">{m.sender} ti pensa</p>
            <span className="opacity-50">{m.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
      </div>

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
