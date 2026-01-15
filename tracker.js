import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CHAVES NUCLEOINSIGHT
const firebaseConfig = { apiKey: "AIzaSyCFnz5Wis_b3CGGblNn-bfUjqEgTOlqGNE", authDomain: "nucleoinsight-e4566.firebaseapp.com", projectId: "nucleoinsight-e4566", storageBucket: "nucleoinsight-e4566.firebasestorage.app", messagingSenderId: "650150743348", appId: "1:650150743348:web:f62f3cc95a38a5e90ca961" };

const app = initializeApp(firebaseConfig); const db = getFirestore(app);
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('id');
const isTestMode = urlParams.get('mode') === 'test';

let source = urlParams.get('utm_source');
if (!source) {
    const ref = document.referrer;
    if (ref.includes('instagram')) source = 'instagram';
    else if (ref.includes('facebook')) source = 'facebook';
    else if (ref.includes('youtube')) source = 'youtube';
    else if (ref) source = new URL(ref).hostname;
    else source = 'direto';
}

const campaignData = { source: source, campaign: urlParams.get('utm_campaign') || '' };
let sessionId = sessionStorage.getItem('paco_sid');
if(!sessionId) { sessionId = 'u_' + Math.random().toString(36).substr(2, 9); sessionStorage.setItem('paco_sid', sessionId); }

export async function trackEvent(name, data = {}) {
    if (!offerId) return;
    try {
        await addDoc(collection(db, "events"), {
            offerId, sessionId, type: name, isTest: isTestMode, campaign: campaignData,
            createdAt: serverTimestamp(), device: { ua: navigator.userAgent }, data
        });
    } catch (e) { console.error("Tracker", e); }
}
