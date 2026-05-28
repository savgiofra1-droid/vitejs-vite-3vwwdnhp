import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CornerDownRight, Send, X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat({ userName }: { userName: string }) {
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [msgLimit, setMsgLimit] = useState(50);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Stati per il regalo
  const [giftPopup, setGiftPopup] = useState<any | null>(null);
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Ascolto dei messaggi dalla Home
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(msgLimit));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(fetched.reverse());

      // Rilevamento di un nuovo messaggio per attivare il pacco regalo
      if (!isInitialMount.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Si attiva solo se non l'hai inviato tu e se CONTIENE un testo o una foto (esclude i cuori vuoti)
            if (data.sender !== userName && (data.text || data.img)) {
              setGiftPopup({ id: change.doc.id, ...data });
              setIsGiftOpened(false);
            }
          }
        });
      } else {
        isInitialMount.current = false;
      }
    });
    return () => unsubscribe();
  }, [msgLimit, userName]);

  // Auto-scroll (si attiva anche quando chiudi un regalo)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, replyingTo, giftPopup]);

  const handleReplySubmit = async (msgId: string) => {
    if (!replyText.trim()) return;
    try {
      await updateDoc(doc(db, "messages", msgId), {
        reply: {
          sender: userName,
          text: replyText.trim()
        }
      });
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error("Errore nell'invio della risposta:", error);
    }
  };

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "OGGI";
    if (date.toDateString() === yesterday.toDateString()) return "IERI";
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };

  // Filtriamo i messaggi: teniamo SOLO quelli che hanno una foto o un testo
  const displayMessages = chatMessages.filter(m => m.img || m.text);

  return (
    <div className="flex flex-col h-full text-white bg-transparent relative">
      
      {/* Intestazione */}
      <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider italic text-red-400 drop-shadow-md shadow-black">La Nostra Bacheca</h2>
      </div>

      {/* Area Contenuti Filtrati */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scroll-smooth">
        
        {displayMessages.length >= msgLimit && (
          <div className="text-center py-2">
            <button 
              onClick={() => setMsgLimit(prev => prev + 50)}
              className="text-xs bg-white/10 border border-white/10 px-3 py-1.5 rounded-full opacity-80 active:scale-95 transition-all font-semibold"
            >
              Carica precedenti
            </button>
          </div>
        )}

        {displayMessages.map((m, index) => {
          const isMe = m.sender === userName;
          const date = m.timestamp?.toDate ? m.timestamp.toDate() : new Date();
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          const prevMsg = index > 0 ? displayMessages[index - 1] : null;
          const prevDate = prevMsg?.timestamp?.toDate ? prevMsg.timestamp.toDate() : null;
          const showSeparator = !prevDate || date.toDateString() !== prevDate.toDateString();

          return (
            <div key={m.id} className="space-y-4 flex flex-col">
              {showSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-black/50 border border-white/5 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest text-white/60 backdrop-blur-sm">
                    {formatDateSeparator(date)}
                  </span>
                </div>
              )}

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}>
                <span className="text-[9px] opacity-50 mb-1 px-1 font-semibold">{m.sender}</span>
                
                {/* Bolla del messaggio */}
                <div className={`p-3 rounded-2xl border backdrop-blur-sm relative min-w-[120px] max-w-[80%] ${
                  isMe 
                    ? 'bg-red-600/30 border-red-500/40 rounded-tr-none text-right' 
                    : 'bg-black/60 border-white/10 rounded-tl-none text-left'
                }`}>
                  {m.img && (
                    <img src={m.img} alt="media" className="w-full rounded-xl mb-2 max-h-48 object-cover border border-white/5" />
                  )}
                  {m.text && <p className="text-sm break-words leading-relaxed">{m.text}</p>}
                  
                  <span className="block text-[8px] opacity-40 mt-2 font-mono">{timeStr}</span>

                  {/* Sezione Risposta Incollata */}
                  {m.reply && (
                    <div className={`mt-3 pt-2 border-t border-white/20 text-left ${isMe ? 'text-right' : 'text-left'}`}>
                      <span className="text-[9px] opacity-60 font-bold block mb-1 text-red-300">
                        {m.reply.sender} ha risposto:
                      </span>
                      <p className="text-sm italic opacity-90">{m.reply.text}</p>
                    </div>
                  )}
                </div>

                {/* Pulsante per rispondere */}
                {!m.reply && (
                  <div className={`mt-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {replyingTo === m.id ? (
                      <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10 mt-1 backdrop-blur-md w-64 z-10 shadow-xl">
                        <input 
                          autoFocus
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Scrivi una risposta..."
                          className="bg-transparent text-xs text-white px-2 focus:outline-none flex-1 placeholder-white/40"
                        />
                        <button onClick={() => handleReplySubmit(m.id)} className="bg-red-600 p-1.5 rounded-lg text-white active:scale-95">
                          <Send size={12} />
                        </button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="bg-white/10 p-1.5 rounded-lg text-white/60 active:scale-95">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReplyingTo(m.id)} 
                        className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/40 hover:text-white/80 transition-colors px-1 py-1"
                      >
                        <CornerDownRight size={12} /> Rispondi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* ----------- POP-UP REGALO ----------- */}
      <AnimatePresence>
        {giftPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-6"
          >
            {!isGiftOpened ? (
              <motion.div 
                initial={{ scale: 0.5, y: 50 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Sorpresa!</h3>
                  <p className="text-sm text-white/60">Hai ricevuto un regalo da {giftPopup.sender}</p>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={() => setIsGiftOpened(true)} 
                  className="bg-red-600 p-8 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.5)] border-4 border-red-400/30"
                >
                  <Gift size={64} className="text-white" />
                </motion.button>
                
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest animate-pulse mt-4">
                  Tocca per scartare
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="w-full max-w-sm bg-white/10 border border-white/20 p-6 rounded-3xl flex flex-col gap-4 text-center shadow-2xl relative"
              >
                <div className="absolute -top-4 -right-4">
                  <button onClick={() => setGiftPopup(null)} className="bg-red-500 p-2 rounded-full text-white shadow-lg active:scale-95">
                    <X size={20} />
                  </button>
                </div>

                <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Da {giftPopup.sender}</p>

                {giftPopup.img && (
                  <div className="w-full max-h-[40vh] rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    <img src={giftPopup.img} alt="Regalo" className="w-full h-full object-contain" />
                  </div>
                )}

                {giftPopup.text && (
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                    <p className="text-base text-white font-medium italic">"{giftPopup.text}"</p>
                  </div>
                )}
                
                <button onClick={() => setGiftPopup(null)} className="mt-4 bg-white/10 py-3 rounded-xl text-sm font-bold active:scale-95">
                  Vai alla Bacheca
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
