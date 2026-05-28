import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, Image as ImageIcon, MessageCircle, Edit2, Trash2, Star, Loader2 } from 'lucide-react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db } from './firebase'; // <--- CORRETTO con la 'f' minuscola './firebase'

// --- FUNZIONI UTILITY GLOBALI ---
const formattaData = (mem: any) => {
  try {
    if (mem.date) return new Date(mem.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (mem.timestamp?.toDate) return mem.timestamp.toDate().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return 'Data speciale';
  } catch (e) { return 'Data speciale'; }
};

const getCoverImg = (mem: any) => {
  if (mem.imgUrls && Array.isArray(mem.imgUrls) && mem.imgUrls.length > 0) return mem.imgUrls[0];
  return mem.img || mem.image || mem.imageUrl || mem.url || "";
};

const getMeseAnno = (mem: any) => {
  try {
    let d = new Date();
    if (mem.date) d = new Date(mem.date);
    else if (mem.timestamp?.toDate) d = mem.timestamp.toDate();
    else if (mem.createdAt) d = new Date(mem.createdAt);
    return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(d).toUpperCase();
  } catch (e) { return ''; }
};


// --- SOTTO-COMPONENTE MEMORY CARD (ANTEPRIMA IN GRIGLIA CON AUTOPLAY 2s) ---
interface MemoryCardProps {
  mem: any;
  onOpen: (mem: any) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ mem, onOpen }) => {
  const [currentGridImgIndex, setCurrentGridImgIndex] = useState(0);
  
  const urls = (mem.imgUrls && Array.isArray(mem.imgUrls) && mem.imgUrls.length > 0) 
    ? mem.imgUrls 
    : [getCoverImg(mem)];
  
  const fotoCount = urls.length;
  const titolo = mem.title || mem.text || "Ricordo";

  useEffect(() => {
    if (fotoCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentGridImgIndex((prevIndex) => (prevIndex + 1) % fotoCount);
    }, 2000); 

    return () => clearInterval(interval);
  }, [fotoCount]);

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onOpen(mem)}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-lg group border border-white/10 bg-black/40"
    >
      <img 
        src={urls[currentGridImgIndex]} 
        alt={titolo} 
        className="w-full h-full object-cover transition-all duration-700" 
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
        <h3 className="font-bold text-sm leading-tight drop-shadow-md text-ellipsis overflow-hidden whitespace-nowrap">{titolo}</h3>
        <p className="text-[10px] text-white/70 font-mono mt-0.5 drop-shadow-md">{formattaData(mem)}</p>
        
        {fotoCount > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-white/20 flex items-center gap-1">
            <ImageIcon size={10} /> {fotoCount}
          </div>
        )}
      </div>
    </motion.div>
  );
};


// --- COMPONENTE PRINCIPALE MEMORIES ---
export default function Memories() {
  const userName = localStorage.getItem('userName') || 'Tizzi';
  const otherUser = userName === 'Tizzi' ? 'Sofia' : 'Tizzi';
  
  const [memories, setMemories] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); 
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [currentPopupImgIndex, setCurrentPopupImgIndex] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImgUrls, setEditImgUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ricordi"), (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      try {
        docs.sort((a: any, b: any) => {
          const estraiTempo = (item: any) => {
            if (!item) return 0;
            if (item.date) { const ms = new Date(item.date).getTime(); if (!isNaN(ms)) return ms; }
            if (item.timestamp && typeof item.timestamp.toDate === 'function') return item.timestamp.toDate().getTime();
            if (item.createdAt) { const ms = new Date(item.createdAt).getTime(); if (!isNaN(ms)) return ms; }
            return 0;
          };
          return estraiTempo(b) - estraiTempo(a);
        });
      } catch (err) { console.error("Errore ordinamento", err); }
      setMemories(docs);
    });
    return () => unsubscribe();
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Timeout compressione"));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        const maxSize = 700; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Result = canvas.toDataURL('image/jpeg', 0.55); 
          
          canvas.width = 0;
          canvas.height = 0;
          URL.revokeObjectURL(objectUrl);
          resolve(base64Result);
        } else {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Errore Canvas Context"));
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Errore caricamento immagine"));
      };

      img.src = objectUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const compressedImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const remainingFiles = files.length - i;
      setEstimatedTime(remainingFiles * 2); 
      setUploadStatus(`Ottimizzazione foto ${i + 1} di ${files.length}...`);
      await new Promise(r => setTimeout(r, 100)); 

      try {
        const compressed = await compressImage(files[i]);
        compressedImages.push(compressed);
      } catch (err) {
        console.error("Salto foto pesante: ", err);
      }
    }
    
    setNewImages(prev => [...prev, ...compressedImages]);
    setUploadStatus('');
    setEstimatedTime(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddMemory = async () => {
    if (!newTitle || !newDate || newImages.length === 0) return alert("Inserisci titolo, data e almeno una foto!");
    
    try {
      setIsUploading(true);
      const storage = getStorage(db.app);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < newImages.length; i++) {
        const remainingUploads = newImages.length - i;
        setEstimatedTime(remainingUploads * 3); 
        setUploadStatus(`Invio su database ${i + 1} di ${newImages.length}...`);
        await new Promise(r => setTimeout(r, 50)); 

        const imgName = `memories/${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, imgName);
        await uploadString(storageRef, newImages[i], 'data_url');
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      setUploadStatus("Scrittura sul diario...");
      await addDoc(collection(db, "ricordi"), {
        title: newTitle,
        date: newDate,
        imgUrls: uploadedUrls, 
        comments: { Tizzi: "", Sofia: "" },
        createdAt: new Date().toISOString()
      });

      setIsAdding(false);
      setNewTitle('');
      setNewDate('');
      setNewImages([]);
    } catch (e) {
      console.error(e);
      alert("Errore durante il salvataggio.");
    } finally {
      setUploadStatus('');
      setEstimatedTime(null);
      setIsUploading(false);
    }
  };

  const handleAddPhotoToEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const nuoveUrls: string[] = [];
    const storage = getStorage(db.app);

    for (let i = 0; i < files.length; i++) {
      const remaining = files.length - i;
      setEstimatedTime(remaining * 4); 
      setUploadStatus(`Elaborazione foto ${i + 1} di ${files.length}...`);
      await new Promise(r => setTimeout(r, 100)); 
      
      try {
        const compressed = await compressImage(files[i]);
        setUploadStatus(`Integrazione foto ${i + 1} di ${files.length}...`);
        await new Promise(r => setTimeout(r, 50));

        const imgName = `memories/${Date.now()}_edit_${i}.jpg`;
        const storageRef = ref(storage, imgName);
        await uploadString(storageRef, compressed, 'data_url');
        const url = await getDownloadURL(storageRef);
        nuoveUrls.push(url);
      } catch (err) {
        console.error(err);
      }
    }

    setEditImgUrls(prev => [...prev, ...nuoveUrls]);
    setUploadStatus('');
    setEstimatedTime(null);
    setIsUploading(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const apriRicordo = (mem: any) => {
    setSelectedMemory(mem);
    setCurrentPopupImgIndex(0); 
    setMyComment(mem.comments ? (mem.comments[userName] || '') : '');
    
    setEditTitle(mem.title || mem.text || 'Ricordo');
    let dStr = '';
    if (mem.date) dStr = mem.date;
    else if (mem.timestamp?.toDate) dStr = mem.timestamp.toDate().toISOString().split('T')[0];
    setEditDate(dStr);

    const urls = mem.imgUrls && Array.isArray(mem.imgUrls) ? [...mem.imgUrls] : [mem.img || mem.image || mem.imageUrl || ''];
    setEditImgUrls(urls.filter(Boolean));
    setIsEditingMeta(false);
  };

  const rendiCopertina = (urlScelta: string) => {
    const filtrate = editImgUrls.filter(u => u !== urlScelta);
    setEditImgUrls([urlScelta, ...filtrate]);
  };

  const rimuoviFotoDaEdit = (urlScelta: string) => {
    if (editImgUrls.length <= 1) return alert("Un ricordo deve contenere almeno una foto!");
    setEditImgUrls(editImgUrls.filter(u => u !== urlScelta));
  };

  const salvaModificheMeta = async () => {
    if (!selectedMemory || editImgUrls.length === 0) return;
    try {
      setIsUploading(true);
      setUploadStatus("Salvataggio modifiche...");
      const memRef = doc(db, "ricordi", selectedMemory.id);
      await updateDoc(memRef, { title: editTitle, date: editDate, imgUrls: editImgUrls });
      setSelectedMemory({ ...selectedMemory, title: editTitle, date: editDate, imgUrls: editImgUrls });
      setCurrentPopupImgIndex(0);
      setIsEditingMeta(false);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadStatus('');
      setIsUploading(false);
    }
  };

  const eliminaRicordo = async () => {
    if (window.confirm("Sei sicuro di voler eliminare per sempre questo ricordo?")) {
      try {
        await deleteDoc(doc(db, "ricordi", selectedMemory.id));
        setSelectedMemory(null);
      } catch (e) { console.error(e); }
    }
  };

  const salvaCommento = async () => {
    if (!selectedMemory) return;
    try {
      setIsSavingComment(true);
      const memRef = doc(db, "ricordi", selectedMemory.id);
      const updatedComments = { ...(selectedMemory.comments || {}), [userName]: myComment.trim() };
      await updateDoc(memRef, { comments: updatedComments });
      setSelectedMemory({ ...selectedMemory, comments: updatedComments });
    } catch (e) { console.error(e); } 
    finally { setIsSavingComment(false); }
  };


  return (
    <div className="flex flex-col h-full p-4 pt-16 overflow-y-auto pb-28 text-white relative">
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-widest italic text-red-400 drop-shadow-md">I Nostri Ricordi</h2>
        <p className="text-xs text-white/60 mt-1">Scegli un momento per riviverlo</p>
      </div>

      {memories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 mt-10">
          <ImageIcon size={48} className="mb-4" />
          <p>Nessun ricordo trovato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {(() => {
            let lastMeseAnno = "";
            return memories.map((mem) => {
              const coverImg = getCoverImg(mem);
              if (!coverImg) return null;

              const meseAnnoCorrente = getMeseAnno(mem);
              const mostraIntestazione = meseAnnoCorrente !== lastMeseAnno;
              lastMeseAnno = meseAnnoCorrente;

              return (
                <React.Fragment key={mem.id}>
                  {mostraIntestazione && meseAnnoCorrente !== '' && (
                    <div className="col-span-2 mt-4 mb-1">
                      <h3 className="text-red-500 font-black tracking-widest uppercase text-sm drop-shadow-md">
                        {meseAnnoCorrente}
                      </h3>
                    </div>
                  )}
                  
                  <MemoryCard mem={mem} onOpen={apriRicordo} />
                </React.Fragment>
              );
            });
          })()}
        </div>
      )}

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAdding(true)}
        className="fixed bottom-28 right-6 bg-red-600 p-4 rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.5)] z-40 border border-red-400/30"
      >
        <Plus size={24} />
      </motion.button>

      {/* MODALE AGGIUNTA NUOVO RICORDO */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center">
            <button onClick={() => { setIsAdding(false); setNewImages([]); }} className="absolute top-6 right-6 bg-white/10 p-3 rounded-full"><X size={20} /></button>
            <div className="w-full max-w-sm bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-4 shadow-2xl">
              <h3 className="text-xl font-bold text-red-400 text-center mb-2">Nuovo Ricordo</h3>
              <input type="text" placeholder="Titolo" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-black/50 p-4 rounded-xl text-sm text-white focus:outline-none border border-white/10" />
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-black/50 p-4 rounded-xl text-sm text-white focus:outline-none border border-white/10" />
              <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 p-4 rounded-xl text-sm font-bold border border-white/10 flex items-center justify-center gap-2">
                <ImageIcon size={18} /> Seleziona Foto ({newImages.length} pronte)
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/jpeg, image/png, image/jpg" multiple onChange={handleFileChange} />
              <button onClick={handleAddMemory} disabled={isUploading || newImages.length === 0} className="bg-red-600 py-4 rounded-xl font-bold mt-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50">
                Salva Ricordo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALE RICORDO ESPANSO E DETTAGLI */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col pt-12">
            
            <div className="absolute top-6 right-6 flex gap-3 z-50">
              <button onClick={eliminaRicordo} className="bg-red-500/20 text-red-400 p-2 rounded-full border border-red-500/30 backdrop-blur-md">
                <Trash2 size={20} />
              </button>
              <button onClick={() => setSelectedMemory(null)} className="bg-white/10 p-2 rounded-full border border-white/10 backdrop-blur-md">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 mt-4">
              
              {isEditingMeta ? (
                <div className="px-6 mb-6 flex flex-col items-center gap-3 max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Modifica Ricordo</h3>
                  <input type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="Titolo" className="bg-black/50 border border-white/20 p-3 rounded-xl text-center w-full focus:outline-none" />
                  <input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="bg-black/50 border border-white/20 p-3 rounded-xl text-center w-full focus:outline-none" />
                  
                  <div className="w-full mt-2 border-t border-white/10 pt-4">
                    <p className="text-[10px] font-bold text-white/50 mb-2 uppercase tracking-wider">Gestione Foto ({editImgUrls.length})</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {editImgUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                          <img src={url} className="w-full h-full object-cover" alt="Miniatura" />
                          
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-yellow-500 text-black text-[8px] font-black px-1 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                              COPERTINA
                            </span>
                          ) : (
                            <button onClick={() => rendiCopertina(url)} className="absolute top-1 left-1 bg-black/60 p-1 rounded-md text-white border border-white/10">
                              <Star size={10} />
                            </button>
                          )}
                          
                          <button onClick={() => rimuoviFotoDaEdit(url)} className="absolute bottom-1 right-1 bg-red-600 p-1 rounded-md text-white shadow-md">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button onClick={() => editFileInputRef.current?.click()} className="w-full bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold border border-white/5 flex items-center justify-center gap-2 transition-colors">
                      <Plus size={14} /> Aggiungi Foto
                    </button>
                    <input type="file" ref={editFileInputRef} hidden accept="image/jpeg, image/png, image/jpg" multiple onChange={handleAddPhotoToEdit} />
                  </div>

                  <div className="flex gap-2 w-full mt-4">
                    <button onClick={() => setIsEditingMeta(false)} className="bg-white/10 flex-1 py-3 rounded-xl text-sm font-bold">Annulla</button>
                    <button onClick={salvaModificheMeta} className="bg-red-600 flex-1 py-3 rounded-xl text-sm font-bold shadow-lg">
                      Salva Tutto
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-6 text-center mb-6 relative w-full flex justify-center items-center flex-col">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-white drop-shadow-lg">{selectedMemory.title || selectedMemory.text || 'Ricordo'}</h2>
                      <button onClick={() => setIsEditingMeta(true)} className="text-white/40 hover:text-white/100 transition-colors bg-white/5 p-1.5 rounded-full border border-white/10"><Edit2 size={16}/></button>
                    </div>
                    <p className="text-red-400 font-mono text-sm mt-1">{formattaData(selectedMemory)}</p>
                  </div>

                  <div className="relative w-full h-[50vh] bg-black flex items-center justify-center border-y border-white/10">
                    {selectedMemory.imgUrls && Array.isArray(selectedMemory.imgUrls) && selectedMemory.imgUrls.length > 1 && (
                      <>
                        <button onClick={() => setCurrentPopupImgIndex(prev => (prev - 1 + selectedMemory.imgUrls.length) % selectedMemory.imgUrls.length)} className="absolute left-2 z-10 bg-black/50 p-2 rounded-full border border-white/10 backdrop-blur-md"><ChevronLeft size={24} /></button>
                        <button onClick={() => setCurrentPopupImgIndex(prev => (prev + 1) % selectedMemory.imgUrls.length)} className="absolute right-2 z-10 bg-black/50 p-2 rounded-full border border-white/10 backdrop-blur-md"><ChevronRight size={24} /></button>
                        <div className="absolute bottom-4 flex gap-1.5 z-10 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
                          {selectedMemory.imgUrls.map((_: any, idx: number) => (
                            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentPopupImgIndex ? 'bg-white w-3' : 'bg-white/40'}`} />
                          ))}
                        </div>
                      </>
                    )}
                    <img src={(selectedMemory.imgUrls && Array.isArray(selectedMemory.imgUrls) && selectedMemory.imgUrls.length > 0) ? selectedMemory.imgUrls[currentPopupImgIndex] : getCoverImg(selectedMemory)} alt="Ricordo" className="w-full h-full object-contain" />
                  </div>
                </>
              )}

              <div className="px-6 mt-8 space-y-6 max-w-lg mx-auto">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <MessageCircle size={18} className="text-red-400" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">I Vostri Pensieri</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative">
                    <span className="absolute -top-3 left-4 bg-black px-2 text-[10px] font-bold text-white/50 tracking-widest">{otherUser}</span>
                    <p className="text-sm italic text-white/80 whitespace-pre-wrap">{selectedMemory.comments?.[otherUser] || `Nessun pensiero aggiunto da ${otherUser}.`}</p>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-2xl relative">
                    <span className="absolute -top-3 left-4 bg-black px-2 text-[10px] font-bold text-red-400 tracking-widest">{userName} (Tu)</span>
                    <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} placeholder="Scrivi qui il tuo pensiero legato a questo ricordo..." className="w-full bg-transparent text-sm text-white focus:outline-none resize-none min-h-[80px]" />
                    <div className="flex justify-end mt-2">
                      <button onClick={salvaCommento} disabled={isSavingComment || myComment.trim() === (selectedMemory.comments?.[userName] || '')} className="bg-red-600/80 hover:bg-red-500 disabled:opacity-50 disabled:bg-white/10 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        {isSavingComment ? "Salvataggio..." : "Salva Pensiero"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY DI CARICAMENTO GLOBALE CON TIMER E ROTELLINA */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl max-w-xs w-full flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 size={40} className="text-red-500 animate-spin" />
              <div>
                <p className="text-sm font-bold text-white">{uploadStatus || "Elaborazione in corso..."}</p>
                {estimatedTime !== null && estimatedTime > 0 && (
                  <p className="text-xs text-white/50 mt-1.5 font-mono bg-white/5 py-0.5 px-2 rounded-full inline-block">
                    Tempo stimato rimanente: ~{estimatedTime}s
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
