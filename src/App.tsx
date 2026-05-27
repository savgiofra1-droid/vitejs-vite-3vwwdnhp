import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Gallery from './Gallery';
import Memories from './Memories';
import BottomNav from './BottomNav';
import Welcome from './Welcome';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [isOnboarded, setIsOnboarded] = useState(!!localStorage.getItem('userName'));
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const partnerName = userName === 'Tizzi' ? 'Sofia' : 'Tizzi';

  return (
    <Router>
      <div className="relative h-screen w-full bg-black text-white flex flex-col">
        {/* Sfondo con foto */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/nostra-foto.jpg')" }} 
        />
        {/* Velo scuro per leggibilità */}
        <div className="absolute inset-0 z-0 bg-black/60" />
        
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {!isOnboarded ? (
            <Welcome setUserName={setUserName} setIsOnboarded={setIsOnboarded} />
          ) : (
            <Routes>
              <Route path="/" element={<Home messages={messages} partnerName={partnerName} userName={userName} />} />
              <Route path="/gallery" element={<Gallery messages={messages} userName={userName} partnerName={partnerName} />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </div>
        {isOnboarded && <BottomNav />}
      </div>
    </Router>
  );
}
