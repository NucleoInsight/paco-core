import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG DO PACO
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

// 1. DADOS DA URL E SESSÃO
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test' || window.location.hostname === 'localhost';

// UTMs (Igual ao Sniper)
const campaignData = {
    source: urlParams.get('utm_source') || 'direto',
    medium: urlParams.get('utm_medium') || '',
    campaign: urlParams.get('utm_campaign') || ''
};

// Sessão Persistente (Para agrupar o feed)
let sessionId = sessionStorage.getItem('paco_sid');
if(!sessionId) {
    sessionId = 'u_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('paco_sid', sessionId);
}

// 2. FUNÇÃO RASTREADORA
export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return;

    const payload = {
        offerId: offerId,
        sessionId: sessionId,
        type: eventName,
        isTest: isTestMode,
        campaign: campaignData,
        createdAt: serverTimestamp(),
        device: { ua: navigator.userAgent, url: window.location.href },
        data: eventData
    };

    try {
        await addDoc(collection(db, "events"), payload);
        if(isTestMode) console.log(`🧪 [PACO] ${eventName}`, payload);
    } catch (e) { console.error(e); }
}

// 3. LISTENERS AUTOMÁTICOS (Igual ao Sniper)
if(offerId) {
    trackEvent("offer_view");
    
    // Rastreia cliques em QUALQUER botão/link automaticamente
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .btn');
        if (target) {
            let label = target.innerText || target.id || "Botão sem nome";
            trackEvent("click", { label: label.substring(0, 30) });
            // Se for o botão principal de compra
            if(target.id === 'buyBtn') trackEvent("cta_click"); 
        }
    });
}
