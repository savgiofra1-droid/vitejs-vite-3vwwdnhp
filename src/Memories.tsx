import React from 'react';
import { MapPin, Calendar, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Memories() {
  const ricordi = [
    { 
      id: 1, 
      titolo: "Il Nostro Posto del Cuore", 
      data: "Sempre", 
      desc: "Ogni volta che siamo insieme, qualsiasi posto diventa speciale." 
    },
    { 
      id: 2, 
      titolo: "Sogni per il futuro", 
      data: "Prossimamente", 
      desc: "La mappa dei posti che visiteremo insieme." 
    }
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto safe-pb">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">Il Nostro Mondo</h2>
        <p className="text-white/60 text-sm mt-1">I luoghi che ci appartengono</p>
      </div>

      {/* LA VOSTRA FOTO CARICATA */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative group rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 mb-8"
      >
        <img src="/nostra-foto.jpg" alt="Noi" className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
          <div className="flex items-center gap-2 text-white">
            <Heart size={20} fill="white" />
            <span className="font-bold text-lg">Insieme</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {ricordi.map((r, index) => (
          <motion.div 
            key={r.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex items-start gap-4 shadow-lg"
          >
            <div className="p-3 bg-red-500/20 rounded-xl">
              <MapPin className="text-red-500" size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-white text-lg">{r.titolo}</h3>
                <span className="text-[10px] uppercase tracking-widest text-white/40">{r.data}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{r.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
