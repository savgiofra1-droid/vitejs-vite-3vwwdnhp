import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCZdr1CgAPdVkAptNiQH_6ppm1pyDumk6s',
  authDomain: 'app-mi-manchi.firebaseapp.com',
  projectId: 'app-mi-manchi',
  storageBucket: 'app-mi-manchi.firebasestorage.app',
  messagingSenderId: '273173536701',
  appId: '1:273173536701:web:ace7b7dd68e0048220bcd4',
};

// Inizializza l'app e il database
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
