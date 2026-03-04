import React from 'react';

const DashboardAlerts = ({ todayData, baseFija, saldoGlobalReal }) => {
  if (!todayData || !todayData.fecha) return null;

  const [year, month, day] = todayData.fecha.split('-');
  const fechaFormateada = `${day}/${month}/${year}`;
  
  const baseVal = Number(baseFija) || 0;
  const dispHoyAlInicio = Number(todayData.disponibleDelDia) || 0;
  const gastosHoy = Number(todayData.gastosHoy) || 0;
  const restoHoy = Number(todayData.restanteDelDia) || 0;
  
  // Ahorro que se trae de días atrás
  const ahorroPrevio = dispHoyAlInicio - baseVal;

  // Lógica de colores para el estado actual
  const esNegativo = restoHoy < 0;
  const esBajoBase = restoHoy < baseVal;

  const colorBg = esNegativo ? '#f8d7da' : (esBajoBase ? '#fff3cd' : '#d1ecf1');
  const colorTxt = esNegativo ? '#721c24' : (esBajoBase ? '#856404' : '#0c5460');
  const colorBorde = esNegativo ? '#f5c6cb' : (esBajoBase ? '#ffeeba' : '#bee5eb');

  return (
    <div style={{ marginBottom: '25px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
      
      {/* 1. SALDO GLOBAL (ESTILO BANCO) */}
      <div style={{ background: '#2c3e50', color: 'white', padding: '18px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Saldo Global del Ciclo</span>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '1.8rem' }}>Q{Number(saldoGlobalReal).toFixed(2)}</h2>
      </div>

      {/* 2. DESGLOSE MATEMÁTICO DEL DÍA */}
      <div style={{ padding: '15px', backgroundColor: colorBg, color: colorTxt, borderTop: `1px solid ${colorBorde}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>
          <strong style={{fontSize: '14px'}}>📊 Detalle disponible hoy</strong>
          <span style={{fontSize: '11px', fontWeight: 'bold', background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '4px'}}>📅 {fechaFormateada}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📌 Monto base de hoy:</span> 
            <strong>Q{baseVal.toFixed(2)}</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>💰 Ahorro acumulado anterior:</span> 
            <strong style={{ color: ahorroPrevio < 0 ? '#d9534f' : '#28a745' }}>
              {ahorroPrevio >= 0 ? '+' : ''}Q{ahorroPrevio.toFixed(2)}
            </strong>
          </div>

          {gastosHoy > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d9534f' }}>
              <span>💸 Gastos ya registrados hoy:</span> 
              <strong>-Q{gastosHoy.toFixed(2)}</strong>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '8px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <span>🚀 DISPONIBLE AHORA:</span> 
            <span>Q{restoHoy.toFixed(2)}</span>
          </div>
        </div>

        {/* MENSAJE DE ADVERTENCIA POR EXCESO */}
        {esNegativo && (
          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#721c24', color: 'white', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
            🚨 EXCESO DETECTADO: Has gastado Q{Math.abs(restoHoy).toFixed(2)} de más.
          </div>
        )}
      </div>

      {/* 3. LEYENDA EDUCATIVA (Lo que pediste) */}
      <div style={{ padding: '12px', background: '#ffffff', borderTop: '1px solid #eee', fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{fontSize: '16px'}}>💡</span>
          <div>
            <strong>¿Cómo se calcula el dinero de mañana?</strong><br/>
            Tu disponible para mañana será: <span style={{color: '#2c3e50', fontWeight: 'bold'}}>Q{restoHoy.toFixed(2)} (Restante de hoy)</span> + <span style={{color: '#2c3e50', fontWeight: 'bold'}}>Q{baseVal.toFixed(2)} (Base fija diaria)</span>. 
            ¡Todo lo que no gastes hoy se convierte en tu ahorro para mañana!
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardAlerts;