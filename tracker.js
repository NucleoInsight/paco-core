import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO EXCLUSIVA DO PACO (NÃO MUDE ISSO) ---
const firebaseConfig = {
    apiKey: "AIzaSyBcVJ34TlzOVRUZ0SDJcl8OqF4V7PxxbIg",
    authDomain: "paco-core.firebaseapp.com",
    projectId: "paco-core",
    storageBucket: "paco-core.firebasestorage.app",
    messagingSenderId: "88467987691",
    appId: "1:88467987691:web:85892f360253aa957c72ae"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. CAPTURA PARÂMETROS
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test';

// Captura UTMs para o Feed
const campaignData = {
    source: urlParams.get('utm_source') || 'direto',
    medium: urlParams.get('utm_medium') || '',
    campaign: urlParams.get('utm_campaign') || ''
};

// 2. RASTREAMENTO
export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return;

    const payload = {
        offerId: offerId,
        type: eventName,      // Nome que o painel lê (offer_view, cta_click)
        isTest: isTestMode,   // Separa o teste do real
        campaign: campaignData,
        createdAt: serverTimestamp(), // Data e hora
        userAgent: navigator.userAgent
    };

    try {
        await addDoc(collection(db, "events"), payload);
        if(isTestMode) console.log(`🧪 [PACO TRACKER] Enviado: ${eventName}`);
    } catch (e) {
        console.error("Erro no Tracker:", e);
    }
}
