import React from 'react';

const DashboardAlerts = ({ todayData, baseFija, saldoGlobalReal }) => {
  if (!todayData || !todayData.fecha) return null;

  // --- MODIFICACIÓN DE FECHA ---
  const [year, month, day] = todayData.fecha.split('-');
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const fechaFormateada = `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
  // -----------------------------
  
  const baseVal = Number(baseFija) || 0;
  const dispHoyAlInicio = Number(todayData.disponibleDelDia) || 0;
  const gastosHoy = Number(todayData.gastosHoy) || 0;
  const restoHoy = Number(todayData.restanteDelDia) || 0;
  const ahorroPrevio = dispHoyAlInicio - baseVal;

  // --- LÓGICA DEL SEMÁFORO ---
  let estadoNombre = "";
  let estadoDesc = "";
  let colorBg = "";
  let colorTxt = "";
  let colorBorde = "";

  if (restoHoy < 0) {
    // ROJO: Presupuesto Agotado
    estadoNombre = "🚨 PRESUPUESTO AGOTADO";
    estadoDesc = "Has gastado más de lo que tenías disponible para hoy.";
    colorBg = "#f8d7da"; colorTxt = "#721c24"; colorBorde = "#f5c6cb";
  } else if (restoHoy < baseVal) {
    // AMARILLO: Presupuesto Reducido
    estadoNombre = "⚠️ PRESUPUESTO REDUCIDO";
    estadoDesc = "Te queda menos que tu monto base diario normal debido a gastos previos.";
    colorBg = "#fff3cd"; colorTxt = "#856404"; colorBorde = "#ffeeba";
  } else {
    // AZUL/VERDE: Presupuesto Saludable
    estadoNombre = "✅ PRESUPUESTO SALUDABLE";
    estadoDesc = "Tienes tu base diaria completa + saldo acumulado.";
    colorBg = "#d1ecf1"; colorTxt = "#0c5460"; colorBorde = "#bee5eb";
  }

  return (
    <div style={{ marginBottom: '25px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
      
      {/* 1. SALDO GLOBAL (ESTILO BANCO) */}
      <div style={{ background: '#2c3e50', color: 'white', padding: '18px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Saldo Global del Ciclo</span>
        <h2 style={{ margin: '5px 0 0 0', fontSize: '1.8rem' }}>Q{Number(saldoGlobalReal).toFixed(2)}</h2>
      </div>

      {/* 2. DESGLOSE CON ESTADO CLARO */}
      <div style={{ padding: '15px', backgroundColor: colorBg, color: colorTxt, borderTop: `1px solid ${colorBorde}` }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
          
          <span style={{fontSize: '16px', fontWeight: 'bold', background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '4px'}}>📅 {fechaFormateada}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📌 Monto disponible diario:</span> <strong>Q{baseVal.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>💰 Ahorro acumulado anterior:</span> 
            <strong style={{ color: ahorroPrevio < 0 ? '#d9534f' : '#28a745' }}>
              {ahorroPrevio >= 0 ? '+' : ''}Q{ahorroPrevio.toFixed(2)}
            </strong>
          </div>
          {gastosHoy > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d9534f' }}>
              <span>💸 Gastos ya registrados hoy:</span> <strong>-Q{gastosHoy.toFixed(2)}</strong>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <span>🚀 DISPONIBLE AHORA:</span> <span>Q{restoHoy.toFixed(2)}</span>
          </div> 
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '5px 0' }} /> 
          <div>
            <strong style={{fontSize: '12px', display: 'block'}}>{estadoNombre}</strong>
            <span style={{fontSize: '12px', opacity: 0.8}}>{estadoDesc}</span>
          </div>
        </div>
      </div>



      {/* 4. NOTA EDUCATIVA FINAL */}
      <div style={{ padding: '10px 15px', background: '#f9f9f9', borderTop: '1px solid #eee', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
        💡 Mañana tendrás: Q{restoHoy.toFixed(2)} (lo que sobre hoy) + Q{baseVal.toFixed(2)} (tu base diaria).
      </div>

    </div>
  );
};

export default DashboardAlerts;