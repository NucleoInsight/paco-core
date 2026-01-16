import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURAÇÃO PACO
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

// 1. CAPTURA PARÂMETROS DA URL
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test';

// 2. LÓGICA DE ORIGEM (UTM > Referrer > Direto)
// Aqui estava o erro. Agora ele PRIORIZA o que está na URL.
let source = urlParams.get('utm_source'); 

if (!source) {
    // Se não tem na URL, tenta adivinhar pelo site anterior
    const ref = document.referrer;
    if (ref.includes('instagram.com')) source = 'instagram';
    else if (ref.includes('facebook.com')) source = 'facebook';
    else if (ref.includes('youtube.com')) source = 'youtube';
    else if (ref.includes('google.com')) source = 'google';
    else if (ref.length > 0) source = new URL(ref).hostname;
    else source = 'direto';
}

const campaignData = {
    source: source,
    medium: urlParams.get('utm_medium') || '',
    campaign: urlParams.get('utm_campaign') || ''
};

// 3. SESSÃO
let sessionId = sessionStorage.getItem('paco_sid');
if(!sessionId) {
    sessionId = 'u_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('paco_sid', sessionId);
}

// 4. ENVIO PARA O BANCO
export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return;

    const payload = {
        offerId: offerId,
        sessionId: sessionId,
        type: eventName,
        isTest: isTestMode,
        campaign: campaignData, // <--- AQUI VAI O 'instagram'
        createdAt: serverTimestamp(),
        device: { ua: navigator.userAgent, url: window.location.href },
        data: eventData
    };

    try {
        await addDoc(collection(db, "events"), payload);
        if(isTestMode) console.log(`🧪 [PACO] Source: ${source} | Event: ${eventName}`);
    } catch (e) { console.error(e); }
}

// AUTO-START
if(offerId) {
    trackEvent("offer_view");
    
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .btn');
        if (target) {
            let label = target.innerText || target.id || "Botão";
            trackEvent("click", { label: label.substring(0, 30) });
            if(target.id === 'buyBtn') trackEvent("cta_click"); 
        }
    });
}
