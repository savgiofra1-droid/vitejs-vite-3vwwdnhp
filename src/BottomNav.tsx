import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Image, Heart, MessageCircle } from 'lucide-react';

export default function BottomNav({ unreadBadge }: { unreadBadge?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 z-[100] shadow-[0_-8px_32px_0_rgba(0,0,0,0.4)] pb-8 pt-4 rounded-t-3xl">
      <button onClick={() => navigate('/')} className={`flex flex-col items-center text-xs font-bold transition-colors ${isActive('/') ? 'text-red-500' : 'text-white/60 hover:text-white/80'}`}>
        <Home size={22} className="mb-1.5" />
        Home
      </button>
      <button onClick={() => navigate('/memories')} className={`flex flex-col items-center text-xs font-bold transition-colors ${isActive('/memories') ? 'text-red-500' : 'text-white/60 hover:text-white/80'}`}>
        <Heart size={22} className="mb-1.5" />
        Ricordi
      </button>
      <button onClick={() => navigate('/gallery')} className={`flex flex-col items-center text-xs font-bold transition-colors ${isActive('/gallery') ? 'text-red-500' : 'text-white/60 hover:text-white/80'}`}>
        <Image size={22} className="mb-1.5" />
        Galleria
      </button>
      
      {/* Bottone Chat con Badge Notifiche */}
      <button onClick={() => navigate('/chat')} className={`relative flex flex-col items-center text-xs font-bold transition-colors ${isActive('/chat') ? 'text-red-500' : 'text-white/60 hover:text-white/80'}`}>
        <div className="relative mb-1.5">
          <MessageCircle size={22} />
          {unreadBadge && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border border-black rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
          )}
        </div>
        Chat
      </button>
    </div>
  );
}
