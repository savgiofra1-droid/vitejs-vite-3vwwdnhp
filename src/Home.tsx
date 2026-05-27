import React, { useState, useRef } from 'react';
import { Heart, Image as ImageIcon, Settings, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, partnerName, userName }: any) {
  const [toast, setToast] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMissYou = async (imageUrl = null) => {
    try {
      // INVIA AL DATABASE
      await addDoc(collection(db, 'messages'), {
        sender: userName,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: serverTimestamp(),
        imageUrl: imageUrl,
      });

      setToast(`Hai inviato un 'Mi Manchi' a ${partnerName}!`);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Errore nell'invio:", error);
      alert('Errore di connessione. Riprova!');
    }
  };

  const handlePhotoUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleMissYou(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="safe-pt h-full flex flex-col p-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-zinc-900 border-l-4 border-red-500 text-white px-6 py-4 rounded-xl shadow-lg font-medium flex items-center gap-3 z-50 w-full max-w-sm drop-shadow-md"
          >
            <Heart size={20} fill="#ef4444" color="#ef4444" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">
          Mi Manchi
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
        >
          <Settings size={24} color="white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={() => handleMissYou()}
          className="active:scale-95 transition-transform duration-200"
        >
          <div className="w-40 h-40 bg-red-600/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.7)]">
            <Heart
              size={80}
              fill="white"
              color="white"
              className="animate-pulse"
            />
          </div>
        </button>
        <p className="mt-6 text-white/90 text-xl font-medium drop-shadow-md">
          Tocca per dirle che ti manca
        </p>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex items-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-lg font-semibold active:bg-white/20 transition-colors"
        >
          <ImageIcon size={20} />
          <span>Invia con foto</span>
        </button>
      </div>

      <div
        className="h-1/3 bg-black/50 backdrop-blur-xl rounded-t-3xl p-6 overflow-y-auto mt-4 drop-shadow-md"
        onTouchStart={handlePullToRefresh}
      >
        {isRefreshing && (
          <div className="text-center text-white/50 text-sm mb-4 animate-pulse">
            Aggiornamento...
          </div>
        )}
        {messages.length === 0 ? (
          <p className="text-center text-white/50 mt-4 text-lg">
            Nessun messaggio ancora. Inizia tu!
          </p>
        ) : (
          messages.map((msg: any) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-4 shadow-sm"
            >
              <Heart size={18} fill="#ef4444" color="#ef4444" />
              <div className="flex-1">
                <p className="font-semibold text-white text-lg">
                  {msg.sender === userName ? 'Tu' : msg.sender}
                </p>
                <p className="text-white/80">ha inviato un Mi Manchi</p>
                <span className="text-white/50 text-xs ml-2">{msg.time}</span>
              </div>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Allegato"
                  className="w-12 h-12 object-cover rounded-md border border-white/10"
                />
              )}
            </motion.div>
          ))
        )}
      </div>

      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col justify-end">
          <div className="bg-zinc-950 w-full rounded-t-3xl p-6 safe-pb">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Impostazioni</h2>
              <button onClick={() => setIsSettingsOpen(false)}>
                <X color="white" />
              </button>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Sicuro di voler resettare il tuo nome?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-500 p-4 rounded-xl text-lg font-semibold"
            >
              <Trash2 size={20} />
              Reset App (Cambia Nome)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
