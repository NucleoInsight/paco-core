import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyBcVJ34TlzOVRUZ0SDJcl8OqF4V7PxxbIg", authDomain: "paco-core.firebaseapp.com", projectId: "paco-core", storageBucket: "paco-core.firebasestorage.app", messagingSenderId: "88467987691", appId: "1:88467987691:web:85892f360253aa957c72ae" };
const app = initializeApp(firebaseConfig); const db = getFirestore(app);

// 1. CAPTURA PARÂMETROS
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test' || window.location.hostname === 'localhost';

const campaignData = {
    source: urlParams.get('utm_source') || 'direto',
    medium: urlParams.get('utm_medium') || '',
    campaign: urlParams.get('utm_campaign') || ''
};

// 2. SESSÃO PERSISTENTE (CRUCIAL PARA O AGRUPAMENTO)
let sessionId = sessionStorage.getItem('paco_sid');
if(!sessionId) {
    sessionId = 'u_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('paco_sid', sessionId);
}

// 3. FUNÇÃO DE ENVIO
export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return;

    const payload = {
        offerId: offerId,
        sessionId: sessionId, // O SEGREDINHO DO AGRUPAMENTO
        type: eventName,
        isTest: isTestMode,
        campaign: campaignData,
        createdAt: serverTimestamp(),
        device: { ua: navigator.userAgent },
        data: eventData // Aqui vai o texto do botão
    };

    try {
        await addDoc(collection(db, "events"), payload);
        if(isTestMode) {
            console.log(`🧪 [PACO] ${eventName}`, payload);
            if(!document.getElementById('test-badge')) {
                document.body.insertAdjacentHTML('afterbegin', '<div id="test-badge" style="position:fixed;top:0;left:0;width:100%;background:#f59e0b;color:black;text-align:center;font-size:10px;font-weight:bold;z-index:9999;">MODO TESTE</div>');
            }
        }
    } catch (e) { console.error(e); }
}

// --- AUTOMATIZAÇÃO (IGUAL AO SNIPER) ---

// 1. Rastreia PageView ao entrar
if(offerId) trackEvent("page_view");

// 2. Rastreia TODOS os cliques automaticamente
document.addEventListener('click', (e) => {
    // Procura se clicou em um botão, link ou algo clicável
    const target = e.target.closest('button, a, input[type="submit"], .btn');
    
    if (target) {
        const text = target.innerText || target.value || target.id || "Item sem nome";
        // Envia: "click" com o detalhe do texto (Ex: "click (Eu quase sempre)")
        trackEvent("click", { label: text.substring(0, 30) }); 
    }
});

// 3. Heartbeat (Sinal de vida a cada 15s para mostrar engajamento)
setInterval(() => {
    if(document.visibilityState === 'visible' && offerId) {
        trackEvent("heartbeat");
    }
}, 15000);
