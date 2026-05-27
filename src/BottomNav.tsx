import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Image as ImageIcon, MapPin } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="relative z-20 bg-black/40 backdrop-blur-2xl border-t border-white/10 px-6 py-3 pb-8">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-red-500 scale-110' : 'text-white/40'}`}>
          <Heart size={24} fill={window.location.pathname === '/' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </NavLink>

        <NavLink to="/memories" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-red-500 scale-110' : 'text-white/40'}`}>
          <MapPin size={24} fill={window.location.pathname === '/memories' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Mappa</span>
        </NavLink>

        <NavLink to="/gallery" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-red-500 scale-110' : 'text-white/40'}`}>
          <ImageIcon size={24} fill={window.location.pathname === '/gallery' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Gallery</span>
        </NavLink>
      </div>
    </nav>
  );
}
