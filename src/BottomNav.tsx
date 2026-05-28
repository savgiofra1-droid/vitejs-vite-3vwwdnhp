import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Image, Heart, MessageCircle } from 'lucide-react'; // Importa MessageCircle

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around p-4 bg-black/80 backdrop-blur-md border-t border-white/10 z-[100]">
      <button onClick={() => navigate('/')} className={`flex flex-col items-center text-xs font-bold ${isActive('/') ? 'text-red-500' : 'text-white/60'}`}>
        <Home size={20} className="mb-1" />
        Home
      </button>
      <button onClick={() => navigate('/memories')} className={`flex flex-col items-center text-xs font-bold ${isActive('/memories') ? 'text-red-500' : 'text-white/60'}`}>
        <Heart size={20} className="mb-1" />
        Ricordi
      </button>
      <button onClick={() => navigate('/gallery')} className={`flex flex-col items-center text-xs font-bold ${isActive('/gallery') ? 'text-red-500' : 'text-white/60'}`}>
        <Image size={20} className="mb-1" />
        Galleria
      </button>
      {/* Nuovo Bottone della Chat */}
      <button onClick={() => navigate('/chat')} className={`flex flex-col items-center text-xs font-bold ${isActive('/chat') ? 'text-red-500' : 'text-white/60'}`}>
        <MessageCircle size={20} className="mb-1" />
        Chat
      </button>
    </div>
  );
}
