import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './Home';
import Gallery from './Gallery';
import Memories from './Memories';
import Chat from './Chat';
import BottomNav from './BottomNav';
import Welcome from './Welcome';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Componente per l'animazione di transizione delle pagine
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="h-full w-full absolute inset-0 overflow-hidden"
  >
    {children}
  </motion.div>
);

// Gestore delle Rotte per poter usare useLocation
function AnimatedRoutes({ messages, userName, setUnreadBadge }: any) {
  const location = useLocation();

  // Logica per il Badge delle Notifiche
  useEffect(() => {
    if (location.pathname === '/chat') {
      localStorage.setItem('lastReadChat', Date.now().toString());
      setUnreadBadge(false);
    }
  }, [location.pathname, setUnreadBadge]);

  useEffect(() => {
    if (messages.length > 0 && location.pathname !== '/chat') {
      const lastRead = parseInt(localStorage.getItem('lastReadChat') || '0');
      // Troviamo il primo messaggio che contiene una foto o un testo (i "regali")
      const lastGift = messages.find((m: any) => m.text || m.img);
      if (lastGift) {
        const msgTime = lastGift.timestamp?.toMillis ? lastGift.timestamp.toMillis() : Date.now();
        if (msgTime > lastRead && lastGift.sender !== userName) {
          setUnreadBadge(true);
        }
      }
    }
  }, [messages, location.pathname, userName, setUnreadBadge]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home messages={messages} userName={userName} /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery messages={messages} /></PageTransition>} />
        <Route path="/memories" element={<PageTransition><Memories /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><Chat userName={userName || 'Utente'} /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [isOnboarded, setIsOnboarded] = useState(!!localStorage.getItem('userName'));
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadBadge, setUnreadBadge] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="relative h-screen w-full bg-black text-white flex flex-col overflow-hidden">
        {/* Sfondi */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/nostra-foto.jpg')" }} />
        <div className="absolute inset-0 z-0 bg-black/50" />
        
        {/* Firma Globale Micro-Aesthetic */}
        {isOnboarded && (
          <div className="absolute top-3 left-3 z-[200] pointer-events-none select-none opacity-60">
            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <span className="text-red-400 text-[8px] animate-pulse">❤️</span>
              <span className="text-[7px] font-semibold tracking-[0.15em] text-white/80 uppercase font-mono drop-shadow-md">
                Designed & Developed by Tizzi
              </span>
            </div>
          </div>
        )}

        {/* Gestione delle Pagine */}
        <div className="relative z-10 flex-1 flex flex-col relative w-full h-full">
          {!isOnboarded ? (
            <Welcome setUserName={setUserName} setIsOnboarded={setIsOnboarded} />
          ) : (
            <AnimatedRoutes messages={messages} userName={userName} setUnreadBadge={setUnreadBadge} />
          )}
        </div>
        
        {isOnboarded && <BottomNav unreadBadge={unreadBadge} />}
      </div>
    </Router>
  );
}