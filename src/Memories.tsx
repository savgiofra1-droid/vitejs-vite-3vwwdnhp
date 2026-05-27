import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Camera, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Memories() {
  const [ricordi, setRicordi] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ titolo: '', luogo: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "ricordi"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => setRicordi(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

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

  const handleAdd = async () => {
    if (!formData.titolo || !tempImage) return alert("Inserisci titolo e foto!");
    setLoading(true);
    await addDoc(collection(db, "ricordi"), { ...formData, img: tempImage, timestamp: serverTimestamp() });
    setIsAdding(false); setTempImage(null); setFormData({ titolo: '', luogo: '' }); setLoading(false);
  };

  return (
    <div className="h-full p-4 pb-24 overflow-y-auto bg-black/20">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2 className="text-2xl font-bold uppercase italic">I Nostri Ricordi</h2>
        <button onClick={() => setIsAdding(true)} className="bg-red-500 p-3 rounded-full"><Plus /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ricordi.map((r) => (
          <div key={r.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
            <img src={r.img} className="w-full h-full object-cover" />
            <button onClick={() => deleteDoc(doc(db, "ricordi", r.id))} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full"><Trash2 size={14} color="red" /></button>
            <div className="absolute bottom-0 p-3 w-full bg-gradient-to-t from-black"><p className="font-bold text-sm">{r.titolo}</p></div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-50 bg-[#111] p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between"><h3 className="font-bold">Nuovo Ricordo</h3><button onClick={() => setIsAdding(false)}><X /></button></div>
            <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-white/5 rounded-3xl flex items-center justify-center border border-dashed">
              {tempImage ? <img src={tempImage} className="w-full h-full object-cover" /> : <Camera />}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={async (e) => {
              if (e.target.files?.[0]) {
                const reader = new FileReader();
                reader.onload = async (ev) => setTempImage(await compressImage(ev.target?.result as string));
                reader.readAsDataURL(e.target.files[0]);
              }
            }} />
            <input placeholder="Titolo" className="w-full bg-white/5 p-4 rounded-2xl" onChange={e => setFormData({...formData, titolo: e.target.value})} />
            <button onClick={handleAdd} className="w-full py-5 bg-red-500 rounded-2xl font-bold">Pubblica</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
