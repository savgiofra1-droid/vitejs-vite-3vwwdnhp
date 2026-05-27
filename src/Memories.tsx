import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, Camera, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Memories() {
  const [ricordi, setRicordi] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ titolo: '', luogo: '', data: '', desc: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "ricordi"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setRicordi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // Funzione per convertire l'immagine in un formato salvabile (Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setTempImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.titolo || !tempImage) return alert("Inserisci almeno titolo e foto!");
    setLoading(true);
    try {
      await addDoc(collection(db, "ricordi"), {
        ...formData,
        img: tempImage, // Salviamo la foto nel database
        timestamp: serverTimestamp()
      });
      setIsAdding(false);
      setTempImage(null);
      setFormData({ titolo: '', luogo: '', data: '', desc: '' });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="h-full p-4 pb-24 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">I Nostri Posti</h2>
        <button onClick={() => setIsAdding(true)} className="bg-red-500 p-3 rounded-full shadow-lg shadow-red-500/40">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* GRIGLIA RICORDI */}
      <div className="grid grid-cols-2 gap-3">
        {ricordi.map((r) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            key={r.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group"
          >
            <img src={r.img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
              <h3 className="font-bold text-sm leading-tight">{r.titolo}</h3>
              <p className="text-[10px] text-white/60 flex items-center gap-1 mt-1"><MapPin size={10}/> {r.luogo}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODULO AGGIUNTA (POPUP) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25 }}
            className="absolute inset-0 z-50 bg-[#111] p-6 flex flex-col gap-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Nuovo Ricordo</h3>
              <button onClick={() => setIsAdding(false)} className="bg-white/10 p-2 rounded-full"><X /></button>
            </div>

            {/* SELEZIONE FOTO */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-white/5 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 overflow-hidden"
            >
              {tempImage ? (
                <img src={tempImage} className="w-full h-full object-cover" />
              ) : (
                <> <Camera size={32} className="text-white/20" /> <p className="text-xs text-white/30">Tocca per caricare la foto</p> </>
              )}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />

            <input placeholder="Cosa stavamo facendo?" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10" 
              onChange={e => setFormData({...formData, titolo: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Dove?" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-sm" 
                onChange={e => setFormData({...formData, luogo: e.target.value})} />
              <input placeholder="Quando?" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-sm" 
                onChange={e => setFormData({...formData, data: e.target.value})} />
            </div>

            <textarea placeholder="Scrivi un pensiero..." className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 h-24 text-sm" 
              onChange={e => setFormData({...formData, desc: e.target.value})} />

            <button 
              disabled={loading}
              onClick={handleAdd} 
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${loading ? 'bg-gray-500' : 'bg-red-500 shadow-xl shadow-red-500/20'}`}
            >
              {loading ? "Salvataggio..." : "Pubblica Ricordo"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
