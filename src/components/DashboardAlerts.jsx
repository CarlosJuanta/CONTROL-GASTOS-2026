import React from 'react';

const DashboardAlerts = ({ todayData, baseFija }) => {
  if (!todayData) return null;

  const diff = todayData.disponibleDelDia - baseFija;
  const isReduced = todayData.disponibleDelDia < baseFija;

  return (
    <div style={{ 
      padding: '15px', 
      borderRadius: '8px', 
      backgroundColor: isReduced ? '#fff3cd' : '#d1ecf1',
      border: `1px solid ${isReduced ? '#ffeeba' : '#bee5eb'}`,
      marginBottom: '20px',
      color: '#856404'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>💡 Resumen de Hoy</h3>
      <p style={{ fontSize: '1.1em', margin: 0 }}>
        Tu disponible para hoy es: <strong>Q{todayData.disponibleDelDia.toFixed(2)}</strong>
      </p>
      
      {isReduced ? (
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#721c24' }}>
          ⚠️ Alerta de Equilibrio: Tu disponible hoy es menor a tu base fija (Q{baseFija.toFixed(2)}). 
          Para recuperar tu base mañana, hoy no deberías gastar más de 
          <span style={{ fontSize: '1.2em' }}> Q{todayData.disponibleDelDia.toFixed(2)}</span>.
        </p>
      ) : (
        <p style={{ marginTop: '10px', color: '#0c5460' }}>
          ✅ Vas por buen camino. Tienes Q{diff.toFixed(2)} extra sobre tu base diaria habitual.
        </p>
      )}
    </div>
  );
};

export default DashboardAlerts;