import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Camera, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Memories() {
  const [ricordi, setRicordi] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ titolo: '', data: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Query semplificata per evitare errori su timestamp mancanti
    const q = query(collection(db, "ricordi"));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordiniamo lato client per sicurezza
      docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setRicordi(docs);
    });
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

  const handleSave = async () => {
    if (!formData.titolo || !tempImage) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, "ricordi", editingId), { ...formData, img: tempImage });
      } else {
        await addDoc(collection(db, "ricordi"), { ...formData, img: tempImage, timestamp: serverTimestamp() });
      }
      setIsAdding(false); setEditingId(null); setTempImage(null); setFormData({ titolo: '', data: '' });
    } catch (e) { alert("Errore nel salvataggio"); }
  };

  return (
    <div className="h-full p-4 pb-24 overflow-y-auto bg-black text-white">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2 className="text-2xl font-bold uppercase italic">I Nostri Ricordi</h2>
        <button onClick={() => setIsAdding(true)} className="bg-red-500 p-3 rounded-full"><Plus /></button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ricordi.map((r) => (
          <div key={r.id} className="relative flex flex-col gap-2 bg-white/5 p-2 rounded-2xl">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
              <img src={r.img} alt="ricordo" className="w-full h-full object-cover" />
              <button onClick={() => deleteDoc(doc(db, "ricordi", r.id))} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><Trash2 size={14} color="red" /></button>
              <button onClick={() => { setEditingId(r.id); setFormData({titolo: r.titolo, data: r.data}); setTempImage(r.img); setIsAdding(true); }} className="absolute top-2 left-2 bg-black/50 p-1 rounded-full"><Edit2 size={14} color="white" /></button>
            </div>
            <div className="px-1">
              <p className="font-bold text-sm truncate">{r.titolo}</p>
              <p className="text-[10px] opacity-60">{r.data}</p>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black p-6 flex flex-col gap-4">
          <h3 className="font-bold">{editingId ? 'Modifica' : 'Nuovo Ricordo'}</h3>
          <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-white/10 rounded-2xl flex items-center justify-center border border-dashed">
            {tempImage ? <img src={tempImage} className="w-full h-full object-cover rounded-2xl" /> : <Camera />}
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
            if (e.target.files?.[0]) {
              const reader = new FileReader();
              reader.onload = async (ev) => setTempImage(await compressImage(ev.target?.result as string));
              reader.readAsDataURL(e.target.files[0]);
            }
          }} />
          <input value={formData.titolo} placeholder="Titolo" className="w-full bg-white/10 p-4 rounded-xl" onChange={e => setFormData({...formData, titolo: e.target.value})} />
          <input value={formData.data} placeholder="Data (es. 28 Maggio 2026)" className="w-full bg-white/10 p-4 rounded-xl" onChange={e => setFormData({...formData, data: e.target.value})} />
          <button onClick={handleSave} className="w-full py-4 bg-red-500 rounded-xl font-bold">Salva</button>
          <button onClick={() => setIsAdding(false)} className="w-full py-2 opacity-50">Annulla</button>
        </div>
      )}
    </div>
  );
}
