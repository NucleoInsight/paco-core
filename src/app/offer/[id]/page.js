'use client';

import { useEffect, useState } from 'react';
// Importa a lógica que criamos (sobe 3 pastas para achar)
import { getOffer, trackView, trackClick } from '../../../offer/logic';

export default function OfferPage({ params }) {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  // O ID vem da URL (ex: /offer/A1JMcJY...)
  const offerId = params.id;

  useEffect(() => {
    // 1. Busca os dados assim que a tela abre
    async function load() {
      if (offerId) {
        const data = await getOffer(offerId);
        setOffer(data);
        setLoading(false);
        
        // 2. Registra a visualização (view) no banco
        if (data) trackView(offerId);
      }
    }
    load();
  }, [offerId]);

  const handleBuy = () => {
    // 3. Registra o clique no botão
    trackClick(offerId);
    alert("Clique registrado! Você seria levado ao checkout agora.");
  };

  if (loading) return <div style={styles.container}>Carregando oferta...</div>;
  if (!offer) return <div style={styles.container}>Oferta não encontrada. Verifique o ID.</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.headline}>{offer.headline}</h1>
      <p style={styles.sub}>{offer.name}</p>
      
      <div style={styles.priceBox}>
        <span style={styles.currency}>R$</span>
        <span style={styles.price}>{offer.price}</span>
      </div>

      <button onClick={handleBuy} style={styles.button}>
        QUERO APROVEITAR AGORA
      </button>

      <p style={styles.footer}>
        Ambiente Seguro • Compra Verificada
      </p>
    </div>
  );
}

// Estilos simples (CSS no Javascript) para não complicar com arquivos extras
const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  headline: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '10px',
  },
  sub: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
  },
  priceBox: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: '30px',
  },
  currency: {
    fontSize: '20px',
    verticalAlign: 'top',
    marginRight: '5px',
  },
  button: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '20px 40px',
    fontSize: '20px',
    fontWeight: 'bold',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 0 #c0392b',
  },
  footer: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#999',
  }
};
