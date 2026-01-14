import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcVJ34TlzOVRUZ0SDJcl8OqF4V7PxxbIg",
  authDomain: "paco-core.firebaseapp.com",
  projectId: "paco-core",
  storageBucket: "paco-core.firebasestorage.app",
  messagingSenderId: "88467987691",
  appId: "1:88467987691:web:85892f360253aa957c72ae"
};

// Inicializa o Firebase e exporta o banco de dados (db) e autenticação (auth)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
