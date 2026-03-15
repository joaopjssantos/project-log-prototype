import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Cole as SUAS chaves aqui:
const firebaseConfig = {
    apiKey: "AIzaSyBcODmiITPQLJFxnz8xDUTGMlo6TmzAoNo",
    authDomain: "prototype-log.firebaseapp.com",
    projectId: "prototype-log",
    storageBucket: "prototype-log.firebasestorage.app",
    messagingSenderId: "268059657803",
    appId: "1:268059657803:web:1c68478c7d86bddcaa2fce"
};

// Inicializa o Firebase no Frontend
const app = initializeApp(firebaseConfig);

// Exporta o "Porteiro" para usarmos na página
export const auth = getAuth(app);