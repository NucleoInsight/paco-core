import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURAÇÃO DO PACO (Não use a do NucleoInsight aqui)
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
const isTestMode = urlParams.get('mode') === 'test';
const offerId = urlParams.get('id');

// 2. ID DE SESSÃO (Para o Feed saber que é a mesma pessoa)
let sessionId = sessionStorage.getItem('paco_session');
if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('paco_session', sessionId);
}

// 3. FUNÇÃO DE RASTREAMENTO EXPORTADA
export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return; // Não rastreia sem oferta

    const payload = {
        offerId: offerId, // Vincula à oferta específica
        eventName: eventName, // 'page_view', 'checkout_click'
        type: eventName, // Compatibilidade com painel antigo
        isTest: isTestMode, // SEPARA OS DADOS
        sessionId: sessionId,
        createdAt: serverTimestamp(),
        device: {
            userAgent: navigator.userAgent,
            url: window.location.href
        },
        data: eventData
    };

    try {
        // Salva na coleção 'events' (que seu painel já lê)
        await addDoc(collection(db, "events"), payload);

        if (isTestMode) {
            console.log(`🧪 [TESTE] ${eventName}`, payload);
            showTestBanner();
        }

    } catch (e) {
        console.error("Erro no Tracker:", e);
    }
}

// Mostra faixa amarela se for teste
function showTestBanner() {
    if (!document.getElementById('test-banner')) {
        const banner = document.createElement('div');
        banner.id = 'test-banner';
        banner.innerHTML = '🧪 MODO DE TESTE ATIVADO - DADOS NÃO CONTABILIZADOS';
        banner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#f59e0b;color:black;text-align:center;font-size:10px;font-weight:bold;padding:5px;z-index:9999;";
        document.body.prepend(banner);
    }
}
