import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image, BookHeart } from 'lucide-react'; // Usiamo BookHeart per i ricordi

export default function BottomNav() {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 w-full bg-black/80 backdrop-blur-lg border-t border-white/10 p-4 flex justify-around pb-6 z-50">
      <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-red-500' : 'text-white'}`}>
        <Home size={24} />
        <span className="text-[10px] mt-1">Home</span>
      </Link>
      
      <Link to="/gallery" className={`flex flex-col items-center ${location.pathname === '/gallery' ? 'text-red-500' : 'text-white'}`}>
        <Image size={24} />
        <span className="text-[10px] mt-1">Galleria</span>
      </Link>

      <Link to="/memories" className={`flex flex-col items-center ${location.pathname === '/memories' ? 'text-red-500' : 'text-white'}`}>
        <BookHeart size={24} />
        <span className="text-[10px] mt-1">Ricordi</span>
      </Link>
    </div>
  );
}
