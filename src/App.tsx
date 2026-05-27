import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ... (altri import invariati)

export default function App() {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [isOnboarded, setIsOnboarded] = useState(!!localStorage.getItem('userName'));
  const [messages, setMessages] = useState<any[]>([]);
  
  // Logica Tema Notte/Giorno
  const isNight = new Date().getHours() >= 22 || new Date().getHours() < 6;

  return (
    <Router>
      {/* Classe dinamica 'night-mode' se è notte */}
      <div className={`relative h-screen w-full ${isNight ? 'bg-indigo-950' : 'bg-black'} text-white flex flex-col transition-colors duration-1000`}>
        {/* ... il resto rimane uguale ... */}
      </div>
    </Router>
  );
}
