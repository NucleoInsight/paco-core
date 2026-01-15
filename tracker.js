import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyBcVJ34TlzOVRUZ0SDJcl8OqF4V7PxxbIg", authDomain: "paco-core.firebaseapp.com", projectId: "paco-core", storageBucket: "paco-core.firebasestorage.app", messagingSenderId: "88467987691", appId: "1:88467987691:web:85892f360253aa957c72ae" };
const app = initializeApp(firebaseConfig); const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test';

// LÓGICA DE ORIGEM (UTM > Referrer > Direto)
let source = urlParams.get('utm_source');
if (!source) {
    const ref = document.referrer;
    if (ref.includes('instagram')) source = 'instagram';
    else if (ref.includes('facebook')) source = 'facebook';
    else if (ref.includes('google')) source = 'google';
    else if (ref.includes('youtube')) source = 'youtube';
    else if (ref) source = new URL(ref).hostname;
    else source = 'direto';
}

const campaignData = {
    source: source,
    medium: urlParams.get('utm_medium') || '',
    campaign: urlParams.get('utm_campaign') || ''
};

let sessionId = sessionStorage.getItem('paco_sid');
if(!sessionId) {
    sessionId = 'u_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('paco_sid', sessionId);
}

export async function trackEvent(eventName, eventData = {}) {
    if (!offerId) return;

    const payload = {
        offerId: offerId,
        sessionId: sessionId,
        type: eventName,
        isTest: isTestMode,
        campaign: campaignData, // ENVIA A ORIGEM CORRETA
        createdAt: serverTimestamp(),
        device: { ua: navigator.userAgent, url: window.location.href },
        data: eventData
    };

    try { await addDoc(collection(db, "events"), payload); } catch (e) { console.error(e); }
}

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
