import { db } from '../firebase/config';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// FUNÇÃO 1: Busca os dados da oferta pelo ID
export async function getOffer(offerId) {
  try {
    const docRef = doc(db, "offers", offerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("Oferta não encontrada!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar oferta:", error);
    return null;
  }
}

// FUNÇÃO 2: Registra que alguém viu a página (sem pixel, direto no banco)
export async function trackView(offerId) {
  try {
    await addDoc(collection(db, "events"), {
      offerId: offerId,
      type: "offer_view",
      createdAt: serverTimestamp()
    });
    console.log("Visualização registrada!");
  } catch (error) {
    console.error("Erro ao registrar view:", error);
  }
}

// FUNÇÃO 3: Registra o clique no botão de compra
export async function trackClick(offerId) {
  try {
    await addDoc(collection(db, "events"), {
      offerId: offerId,
      type: "cta_click",
      createdAt: serverTimestamp()
    });
    console.log("Clique registrado!");
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
  }
}
