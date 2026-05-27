import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './Home';
import Gallery from './Gallery';
import BottomNav from './BottomNav';
import Welcome from './Welcome';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Controlla se il nome è già stato inserito
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      setIsOnboarded(true);
    }

    // CONNESSIONE IN TEMPO REALE AL DATABASE
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const partnerName = 'Sofia';

  return (
    <Router>
      <div className="relative h-screen w-full bg-black text-white flex flex-col">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/sfondo.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-black/60" />
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              {!isOnboarded ? (
                <>
                  <Route
                    path="/welcome"
                    element={
                      <Welcome
                        setUserName={setUserName}
                        setIsOnboarded={setIsOnboarded}
                      />
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/welcome" replace />}
                  />
                </>
              ) : (
                <Route
                  path="/*"
                  element={
                    <AnimatedAppRoutes
                      messages={messages}
                      partnerName={partnerName}
                      userName={userName}
                    />
                  }
                />
              )}
            </Routes>
          </AnimatePresence>
        </div>
        {isOnboarded && <BottomNav />}
      </div>
    </Router>
  );
}

function AnimatedAppRoutes({ messages, partnerName, userName }: any) {
  const location = useLocation();
  if (!userName) return null;
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home
                messages={messages}
                partnerName={partnerName}
                userName={userName}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/gallery"
          element={
            <PageWrapper>
              <Gallery
                messages={messages}
                userName={userName}
                partnerName={partnerName}
              />
            </PageWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 h-full overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
