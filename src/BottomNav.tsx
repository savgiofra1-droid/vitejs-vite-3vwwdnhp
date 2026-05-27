import React from 'react';
import { Home, Image as ImageIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="safe-pb bg-black/80 backdrop-blur-lg border-t border-white/10 flex justify-around items-center p-3 z-50">
      <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-red-500' : 'text-white/50'}`}>
        <Home size={24} />
        <span className="text-xs font-medium">Home</span>
      </button>
      <button onClick={() => navigate('/gallery')} className={`flex flex-col items-center gap-1 ${location.pathname === '/gallery' ? 'text-red-500' : 'text-white/50'}`}>
        <ImageIcon size={24} />
        <span className="text-xs font-medium">Galleria</span>
      </button>
    </div>
  );
}