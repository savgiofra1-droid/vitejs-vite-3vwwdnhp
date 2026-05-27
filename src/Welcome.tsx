import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome({ setUserName, setIsOnboarded }: any) {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (name.trim()) {
      localStorage.setItem('userName', name);
      setUserName(name);
      setIsOnboarded(true);
      navigate('/');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950 text-white safe-pt"
    >
      <Heart
        size={80}
        fill="#ef4444"
        color="#ef4444"
        className="animate-pulse mb-8"
      />
      <h1 className="text-4xl font-bold mb-4 drop-shadow-md">Benvenuti</h1>
      <p className="text-lg text-white/70 mb-10 text-center">
        Inserisci il tuo nome per iniziare l'app per te e TIZZI.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Il tuo nome"
        className="w-full max-w-sm p-4 text-center rounded-full bg-white/10 text-white text-xl placeholder-white/30 border-2 border-white/10 focus:border-red-500 focus:outline-none focus:ring-0 mb-8 transition-colors"
      />
      <button
        onClick={handleStart}
        className="w-full max-w-sm flex items-center justify-center gap-3 p-4 rounded-full bg-red-600 text-white text-xl font-semibold active:bg-red-700 transition-colors"
      >
        <span>Inizia</span>
      </button>
    </motion.div>
  );
}
