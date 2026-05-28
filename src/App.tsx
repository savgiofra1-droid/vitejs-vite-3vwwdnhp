import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Gallery from './Gallery';
import Memories from './Memories';
import Chat from './Chat';
import BottomNav from './BottomNav';
import Welcome from './Welcome';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [isOnboarded, setIsOnboarded] = useState(!!localStorage.getItem('userName'));
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="relative h-screen w-full bg-black text-white flex flex-col">
        {/* Sfondi */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/nostra-foto.jpg')" }} />
        <div className="absolute inset-0 z-0 bg-black/60" />
        
        {/* Firma Globale Micro-Aesthetic */}
        {isOnboarded && (
          <div className="absolute top-3 left-3 z-[200] pointer-events-none select-none opacity-50">
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 shadow-md">
              <span className="text-red-400 text-[8px] animate-pulse">❤️</span>
              <span className="text-[7px] font-semibold tracking-[0.15em] text-white/70 uppercase font-mono">
                Designed & Developed by Tizzi
              </span>
            </div>
          </div>
        )}

        {/* Gestione delle Pagine */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {!isOnboarded ? (
            <Welcome setUserName={setUserName} setIsOnboarded={setIsOnboarded} />
          ) : (
            <Routes>
              <Route path="/" element={<Home messages={messages} userName={userName} />} />
              <Route path="/gallery" element={<Gallery messages={messages} />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/chat" element={<Chat userName={userName || 'Utente'} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </div>
        
        {isOnboarded && <BottomNav />}
      </div>
    </Router>
  );
}
