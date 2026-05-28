import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Edit2, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Home({ messages, userName }: any) {
  const [time, setTime] = useState(new Date());
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [textMsg, setTextMsg] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [countdown, setCountdown] = useState<{title: string, date: string} | null>(() => {
    const saved = localStorage.getItem('home_countdown');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedLiveMessage, setSelectedLiveMessage] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataInizio = new Date('2026-03-16');
  const giorniInsieme = Math.floor((new Date().getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetCountdown = () => {
    const title = prompt("Titolo dell'evento:") || '';
    const date = prompt("Data e ora dell'evento (Formato: YYYY-MM-DD HH:MM):", "2026-12-31 00:00") || '';
    if (title && date) {
      const newCountdown = { title, date };
      setCountdown(newCountdown);
      localStorage.setItem('home_countdown', JSON.stringify(newCountdown));
    }
  };

  const getCountdownString = () => {
    if (!countdown || !countdown.date) return "--d --o --m --s";
    const target = new Date(countdown.date.replace(/-/g, '/')); // Fix per compatibilità cross-browser
    const adesso = new Date();
    const diff = target.getTime() - adesso.getTime();

    if (diff <= 0) return "Evento iniziato!";

    const gg = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hh = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mm = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const ss = Math.floor((diff % (1000 * 60)) / 1000);

    return `${gg}g ${hh}o ${mm}m ${ss}s`;
  };

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

  const sendAction = async (imgData: string | null = null, msgText: string = '') => {
    try {
      await addDoc(collection(db, "messages"), { 
        sender: userName, 
        img: imgData, 
        text: msgText,
        timestamp: serverTimestamp() 
      });
      setTempImg(null); setTextMsg(''); setShowOptions(false);
    } catch (e) { console.error("Errore:", e); }
  };

  const oggiStr = new Date().toLocaleDateString();
  const messaggiOggi = messages.filter((m: any) => m.timestamp?.toDate ? m.timestamp.toDate().toLocaleDateString() === oggiStr : false).length;
  const cuoriTizzi = messages.filter((m: any) => m.sender === 'Tizzi').length;
  const cuoriSofia = messages.filter((m: any) => m.sender === 'Sofia').length;

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto pb-24 text-white">
      <button onClick={() => window.location.reload()} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full z-50"><RefreshCw size={16} /></button>

      {/* Box Ora e Data */}
      <div className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center mb-4">
        <h1 className="text-4xl font-bold">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h1>
        <div className="mt-2 bg-white/10 py-1 px-3 rounded-full inline-block text-xs font-medium uppercase tracking-widest">
           {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <p className="text-red-400 text-sm font-bold mt-2">{giorniInsieme} giorni insieme</p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-white/10 p-2 rounded-xl text-center"><p className="text-[9px] opacity-70">Oggi</p><p className="text-lg font-bold">{messaggiOggi}</p></div>
        <div className="bg-white/10 p-2 rounded-xl text-center"><p className="text-[9px] opacity-70">Tot.</p><p className="text-lg font-bold">{messages.length}</p></div>
        <div className="bg-blue-600/20 p-2 rounded-xl text-center border border-blue-500/20"><p className="text-[9px] opacity-70">Tizzi</p><p className="text-lg font-bold">{cuoriTizzi}</p></div>
        <div className="bg-pink-600/20 p-2 rounded-xl text-center border border-pink-500/20"><p className="text-[9px] opacity-70">Sofia</p><p className="text-lg font-bold">{cuoriSofia}</p></div>
      </div>

      {/* Countdown Box */}
      <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 p-4 rounded-3xl mb-6 border border-white/10 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase opacity-70 tracking-wider">Countdown</p>
          <p className="font-bold text-base">{countdown ? countdown.title : "Nessun evento"}</p>
          <p className="text-sm font-mono text-red-400 mt-0.5 font-bold">{getCountdownString()}</p>
        </div>
        <button onClick={handleSetCountdown} className="p-2 bg-white/10 rounded-full"><Edit2 size={16}/></button>
      </div>

      {/* Pulsantone Cuore */}
      <div className="flex flex-col items-center mb-8 gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowOptions(!showOptions)} className="w-32 h-32 bg-red-600 rounded-full shadow-lg text-5xl flex items-center justify-center">❤️</motion.button>
        {showOptions && (
          <div className="flex flex-col gap-2 w-full max-w-[250px]">
            <button onClick={() => sendAction(null)} className="bg-white/10 p-3 rounded-xl text-sm font-bold">Solo Cuore</button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 p-3 rounded-xl text-sm font-bold">Cuore con Foto</button>
            <div className="flex gap-2">
              <input placeholder="Scrivi..." value={textMsg} onChange={e => setTextMsg(e.target.value)} className="bg-white/5 p-3 rounded-xl flex-1 text-sm text-white focus:outline-none border border-white/10"/>
              <button onClick={() => sendAction(null, textMsg)} className="bg-red-500 px-4 rounded-xl font-bold">OK</button>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={async (e) => {
        if (e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = async (ev) => setTempImg(await compressImage(ev.target?.result as string));
          reader.readAsDataURL(e.target.files[0]);
        }
      }} />

      {/* Attività Live */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold opacity-50 uppercase px-2">Attività live (ultimi 10)</h3>
        {messages.slice(0, 10).map((m: any) => {
          const d = m.timestamp?.toDate ? m.timestamp.toDate() : new Date();
          return (
            <div 
              key={m.id} 
              onClick={() => setSelectedLiveMessage(m)}
              className="bg-black/40 p-3 rounded-xl text-xs flex justify-between items-center border border-white/5 active:bg-white/5 cursor-pointer transition-all"
            >
              <span className="flex-1 font-bold">{m.sender} <span className="font-normal opacity-80">{m.img && m.text ? "cuore, foto e testo" : m.img ? "cuore e foto" : m.text ? `testo: "${m.text.substring(0,10)}..."` : "un cuore"}</span></span>
              <div className="flex gap-1 ml-2">
                <span className="bg-white/10 px-1.5 py-0.5 rounded">{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded">{d.toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Visualizzazione Dettagli Attività Live */}
      <AnimatePresence>
        {selectedLiveMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center">
            <button onClick={() => setSelectedLiveMessage(null)} className="absolute top-6 right-6 bg-white/10 p-3 rounded-full text-white"><X size={20} /></button>
            
            <div className="w-full max-w-sm bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-red-400">{selectedLiveMessage.sender}</p>
                <p className="text-[10px] opacity-50">
                  {selectedLiveMessage.timestamp?.toDate ? selectedLiveMessage.timestamp.toDate().toLocaleString('it-IT') : new Date().toLocaleString('it-IT')}
                </p>
              </div>

              {selectedLiveMessage.img ? (
                <div className="w-full max-h-[50vh] rounded-2xl overflow-hidden bg-black/20 border border-white/10 flex items-center justify-center">
                  <img src={selectedLiveMessage.img} alt="Foto Live" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="text-6xl my-4 animate-pulse">❤️</div>
              )}

              {selectedLiveMessage.text && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-white text-left italic">"{selectedLiveMessage.text}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invio Foto Temporanea */}
      <AnimatePresence>
        {tempImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black p-6 flex flex-col justify-center">
            <img src={tempImg} className="w-full rounded-3xl mb-4 max-h-[60vh] object-contain" />
            <div className="flex gap-2 mb-4">
              <input placeholder="Aggiungi messaggio..." value={textMsg} onChange={e => setTextMsg(e.target.value)} className="bg-white/5 p-4 rounded-2xl flex-1 text-sm text-white focus:outline-none border border-white/10"/>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTempImg(null)} className="bg-white/10 flex-1 py-4 rounded-2xl font-bold text-sm">Annulla</button>
              <button onClick={() => sendAction(tempImg, textMsg)} className="bg-red-600 flex-[2] py-4 rounded-2xl font-bold text-sm">Invia</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
