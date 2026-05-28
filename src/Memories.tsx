import React, { useState, useEffect, useRef } from 'react';
import { Plus, Camera, Trash2, Edit2 } from 'lucide-react';
import { collection, onSnapshot, query, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Memories() {
  const [ricordi, setRicordi] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ titolo: '', data: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "ricordi"));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

  const getMonthYear = (dataStr: string) => {
    if (!dataStr) return { sortKey: "0000-00", displayKey: "ALTRI RICORDI" };
    const s = dataStr.trim().toUpperCase();
    const months = ["GENNAIO", "FEBBRAIO", "MARZO", "APRILE", "MAGGIO", "GIUGNO", "LUGLIO", "AGOSTO", "SETTEMBRE", "OTTOBRE", "NOVEMBRE", "DICEMBRE"];

    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length >= 2) {
        const mStr = parts.length === 3 ? parts[1] : parts[0];
        const yStr = parts.length === 3 ? parts[2] : parts[1];
        const m = parseInt(mStr, 10);
        if (!isNaN(m) && m >= 1 && m <= 12) {
          return { sortKey: `${yStr}-${m.toString().padStart(2, '0')}`, displayKey: `${months[m - 1]} ${yStr}` };
        }
      }
    } else {
      const parts = s.split(' ');
      if (parts.length >= 2) {
        const mName = parts[parts.length - 2];
        const yStr = parts[parts.length - 1];
        const mIndex = months.indexOf(mName);
        if (mIndex !== -1) {
          return { sortKey: `${yStr}-${(mIndex + 1).toString().padStart(2, '0')}`, displayKey: `${mName} ${yStr}` };
        }
      }
    }
    return { sortKey: "0000-00", displayKey: "ALTRI RICORDI" };
  };

  const grouped = ricordi.reduce((acc: any, r: any) => {
    const { sortKey, displayKey } = getMonthYear(r.data);
    if (!acc[sortKey]) acc[sortKey] = { displayKey, items: [] };
    acc[sortKey].items.push(r);
    return acc;
  }, {});

  // Ordina in modo decrescente in base alla sortKey (es. 2026-05 prima di 2026-04)
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="h-full p-4 pb-24 overflow-y-auto text-white">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2 className="text-2xl font-bold uppercase italic shadow-black drop-shadow-md">I Nostri Ricordi</h2>
        <button onClick={() => setIsAdding(true)} className="bg-red-500 p-3 rounded-full"><Plus /></button>
      </div>

      <div className="space-y-8">
        {sortedKeys.map(key => (
          <div key={key}>
            <h3 className="text-red-500 font-bold mb-4 border-b border-white/10 uppercase tracking-widest shadow-black drop-shadow-md">{grouped[key].displayKey}</h3>
            <div className="grid grid-cols-2 gap-4">
              {grouped[key].items.map((r: any) => (
                <div key={r.id} className="relative flex flex-col gap-2 bg-black/40 backdrop-blur-sm p-2 rounded-2xl">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                    <img src={r.img} alt="ricordo" className="w-full h-full object-cover" />
                    <button onClick={() => deleteDoc(doc(db, "ricordi", r.id))} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><Trash2 size={14} color="red" /></button>
                    <button onClick={() => { setEditingId(r.id); setFormData({titolo: r.titolo, data: r.data}); setTempImage(r.img); setIsAdding(true); }} className="absolute top-2 left-2 bg-black/50 p-1 rounded-full"><Edit2 size={14} color="white" /></button>
                  </div>
                  <div className="px-1">
                    <p className="font-bold text-sm truncate">{r.titolo}</p>
                    <p className="text-[10px] opacity-80">{r.data}</p>
                  </div>
                </div>
              ))}
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
          <input value={formData.data} placeholder="Data (es. 28 Maggio 2026 oppure 28/05/2026)" className="w-full bg-white/10 p-4 rounded-xl" onChange={e => setFormData({...formData, data: e.target.value})} />
          <button onClick={handleSave} className="w-full py-4 bg-red-500 rounded-xl font-bold">Salva</button>
          <button onClick={() => setIsAdding(false)} className="w-full py-2 opacity-50">Annulla</button>
        </div>
      )}
    </div>
  );
}
