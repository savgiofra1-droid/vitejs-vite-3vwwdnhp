import React, { useState } from 'react';
import { MapPin, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Memories() {
  const [selected, setSelected] = useState<any>(null);

  const ricordi = [
    { id: 1, titolo: "Il Nostro Posto del Cuore", data: "Sempre", desc: "Ogni volta che siamo insieme, qualsiasi posto diventa speciale." },
    { id: 2, titolo: "Sogni per il futuro", data: "Prossimamente", desc: "La mappa dei posti che visiteremo insieme." }
  ];

  return (
    <div className="h-full p-6 pb-24 overflow-y-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Il Nostro Mondo</h2>
      
      <img src="/nostra-foto.jpg" alt="Noi" className="w-full h-64 object-cover rounded-3xl mb-8 shadow-xl" />

      {ricordi.map((r) => (
        <motion.button 
          key={r.id}
          onClick={() => setSelected(r)}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-white/10 p-5 rounded-2xl mb-4 border border-white/10 text-left flex items-center gap-4"
        >
          <MapPin className="text-red-500" />
          <span className="font-bold">{r.titolo}</span>
        </motion.button>
      ))}

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/90 p-8 flex flex-col justify-center">
            <button onClick={() => setSelected(null)} className="absolute top-8 right-8"><X /></button>
            <h3 className="text-2xl font-bold text-red-500 mb-4">{selected.titolo}</h3>
            <p className="text-lg">{selected.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
