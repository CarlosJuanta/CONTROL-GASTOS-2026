import React from 'react';

const DashboardAlerts = ({ todayData, baseFija, saldoGlobalReal }) => {
  if (!todayData || !todayData.fecha) return null;

  const [year, month, day] = todayData.fecha.split('-');
  const fechaFormateada = `${day}/${month}/${year}`;
  
  const baseVal = Number(baseFija) || 0;
  const dispHoy = Number(todayData.disponibleDelDia) || 0;
  const gastosHoy = Number(todayData.gastosHoy) || 0;
  const restoHoy = Number(todayData.restanteDelDia) || 0;
  const ahorroPrevio = dispHoy - baseVal;

  const colorBg = restoHoy < 0 ? '#f8d7da' : (restoHoy < baseVal ? '#fff3cd' : '#d1ecf1');
  const colorTxt = restoHoy < 0 ? '#721c24' : '#0c5460';

  return (
    <div style={{ marginBottom: '25px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {/* SALDO GLOBAL OSCURO */}
      <div style={{ background: '#2c3e50', color: 'white', padding: '18px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Saldo Global del Ciclo</span>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '1.8rem' }}>Q{Number(saldoGlobalReal).toFixed(2)}</h2>
      </div>

      {/* DESGLOSE COLORIDO */}
      <div style={{ padding: '15px', backgroundColor: colorBg, color: colorTxt }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>
          <strong style={{fontSize: '15px'}}>📊 Detalle disponible hoy</strong>
          <span style={{fontSize: '20px', fontWeight: 'bold'}}>📅 {fechaFormateada}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📌 Disponible base diario:</span> <strong>Q{baseVal.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>💰 Acumulado anterior:</span> 
            <strong style={{ color: ahorroPrevio < 0 ? '#d9534f' : '#28a745' }}>
              {ahorroPrevio >= 0 ? '+' : ''}Q{ahorroPrevio.toFixed(2)}
            </strong>
          </div>
          {gastosHoy > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d9534f' }}>
              <span>💸 Gastos de hoy:</span> <strong>-Q{gastosHoy.toFixed(2)}</strong>
            </div>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <span>🚀 DISPONIBLE TOTAL HOY:</span> <span>Q{restoHoy.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAlerts;