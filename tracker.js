import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURAÇÃO DO PACO
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

// 1. CAPTURA DE PARÂMETROS
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test' || window.location.hostname === 'localhost';

// Captura UTMs (Igual ao Sniper)
const campaignData = {
    source: urlParams.get('utm_source') || 'direct',
    medium: urlParams.get('utm_medium') || 'none',
    campaign: urlParams.get('utm_campaign') || 'none',
    content: urlParams.get('utm_content') || 'none'
};

// ID da Sessão
let sessionId = sessionStorage.getItem('paco_sid');
if(!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('paco_sid', sessionId);
}

// 2. FUNÇÃO DE RASTREAMENTO
export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return;

    const payload = {
        offerId: offerId,
        sessionId: sessionId,
        eventName: eventName, // 'page_view', 'cta_click'
        type: eventName,      // Compatibilidade
        timestamp: new Date(),
        createdAt: new Date(), // Compatibilidade com admin
        isTest: isTestMode,
        campaign: campaignData,
        device: {
            userAgent: navigator.userAgent,
            url: window.location.href
        },
        data: eventData
    };

    try {
        await addDoc(collection(db, "events"), payload);
        
        if(isTestMode) {
            console.log(`🧪 [TESTE] ${eventName}`, payload);
            if(!document.getElementById('test-badge')) {
                const b = document.createElement('div');
                b.id = 'test-badge';
                b.innerHTML = 'MODO TESTE';
                b.style.cssText = 'position:fixed;top:0;left:0;background:#f59e0b;color:black;font-size:10px;padding:2px 5px;font-weight:bold;z-index:9999;';
                document.body.appendChild(b);
            }
        }
    } catch (e) {
        console.error("[Tracker Error]", e);
    }
}

// Auto-track PageView ao carregar
if(offerId) trackEvent("page_view");
