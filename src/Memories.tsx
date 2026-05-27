import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Calendar, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Memories() {
  const [ricordi, setRicordi] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ titolo: '', luogo: '', data: '', desc: '', img: '' });

  // Carica i ricordi dal database in tempo reale
  useEffect(() => {
    const q = query(collection(db, "ricordi"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setRicordi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAdd = async () => {
    await addDoc(collection(db, "ricordi"), { ...formData, timestamp: serverTimestamp() });
    setIsAdding(false);
    setFormData({ titolo: '', luogo: '', data: '', desc: '', img: '' });
  };

  return (
    <div className="h-full p-6 pb-24 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">I Nostri Ricordi</h2>
        <button onClick={() => setIsAdding(true)} className="bg-red-500 p-2 rounded-full"><Plus /></button>
      </div>

      <div className="space-y-4">
        {ricordi.map((r) => (
          <div key={r.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
            {r.img && <img src={r.img} className="w-full h-40 object-cover rounded-xl mb-3" />}
            <h3 className="font-bold text-lg">{r.titolo}</h3>
            <p className="text-sm text-white/50 flex items-center gap-1"><MapPin size={14}/> {r.luogo} • {r.data}</p>
            <p className="mt-2 text-white/80">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* MODULO AGGIUNTA */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black p-6 flex flex-col gap-4">
            <button onClick={() => setIsAdding(false)}><X /></button>
            <input placeholder="Titolo" className="w-full bg-white/10 p-3 rounded-xl" onChange={e => setFormData({...formData, titolo: e.target.value})} />
            <input placeholder="Luogo" className="w-full bg-white/10 p-3 rounded-xl" onChange={e => setFormData({...formData, luogo: e.target.value})} />
            <input placeholder="Data" className="w-full bg-white/10 p-3 rounded-xl" onChange={e => setFormData({...formData, data: e.target.value})} />
            <textarea placeholder="Descrizione" className="w-full bg-white/10 p-3 rounded-xl h-24" onChange={e => setFormData({...formData, desc: e.target.value})} />
            <button onClick={handleAdd} className="bg-red-500 py-4 rounded-xl font-bold">Salva Ricordo</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
