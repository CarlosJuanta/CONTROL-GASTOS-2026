import React, { useState } from "react";
import ExpenseModal from "./ExpenseModal";
import { deleteExpense } from "../services/budgetService";

const BudgetTable = ({ expenses, displayData, todayStr }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  if (!displayData || displayData.length === 0) return null;

  // FUNCIÓN PARA FORMATEAR FECHA: de "2026-03-05" a "05 de marzo de 2026"
  const formatearFechaLarga = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("-");
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
  };

  // Calculamos la fecha de mañana basándonos en todayStr (YYYY-MM-DD)
  const [y, m, d] = todayStr.split('-').map(Number);
  const tomDate = new Date(y, m - 1, d + 1);
  const tomorrowStr = `${tomDate.getFullYear()}-${String(tomDate.getMonth() + 1).padStart(2, '0')}-${String(tomDate.getDate()).padStart(2, '0')}`;

  return (
    <div style={{ width: '100%' }}>
      <div className="scrollable-container">
        <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead className="hide-on-mobile">
            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
              <th style={styles.th}>FECHA</th>
              <th style={styles.th}>BASE</th>
              <th style={styles.th}>DISPONIBLE</th>
              <th style={styles.th}>GASTOS</th>
              <th style={styles.th}>RESTANTE</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row) => {
              const esHoy = row.fecha === todayStr;
              const esPasado = row.fecha < todayStr;
              const esManana = row.fecha === tomorrowStr;

              // --- CONFIGURACIÓN DE ETIQUETAS (data-label) ---
              let labelBase = "Base diaria";
              let labelDisponible = "Monto Disponible Hoy";
              let labelGasto = "Gastos realizados";
              let labelRestante = "Restante hoy";
              let tagFecha = "";

              if (esPasado) {
                // ETIQUETAS PARA FECHAS ANTERIORES
                labelBase = "Disponible base diario";
                labelDisponible = "Monto Disponible";
                labelGasto = "Gastos realizados";
                labelRestante = "Saldo al final del día";
              } else if (esHoy) {
                // ETIQUETAS NORMALES PARA HOY
                tagFecha = "(HOY)";
                labelBase = "Base diaria";
                labelDisponible = "Monto Disponible Hoy";
                labelGasto = "Gastos hoy";
                labelRestante = "Restante hoy";
              } else if (esManana) {
                // ETIQUETA EXCLUSIVA PARA MAÑANA
                tagFecha = "(PROYECCIÓN MAÑANA)";
                labelBase = "Base diaria";
                labelDisponible = "Proyección Disponible Mañana";
                labelGasto = "Gasto proyectado";
                labelRestante = "Saldo al final del día";
              } else {
                // PARA CUALQUIER OTRA FECHA FUTURA (Si pones "Ver Todo")
                labelDisponible = "Proyección Monto Disponible";
                labelGasto = "Gasto proyectado";
                labelRestante = "Saldo al final del día";
              }

              // Lógica de colores de gastos
              const statusGasto = row.gastosHoy <= 0 ? 'none' : (row.gastosHoy <= row.baseFija ? 'good' : (row.gastosHoy <= row.disponibleDelDia ? 'warn' : 'danger'));
              let msjGasto = statusGasto === 'good' ? "✅ Bajo base" : statusGasto === 'warn' ? "🧱 Usando ahorro" : statusGasto === 'danger' ? "🚨 Exceso" : "";
              
              const esReducido = row.disponibleDelDia < row.baseFija;
              const sobranteAyer = row.disponibleDelDia - row.baseFija;
              const textoAhorro = esHoy ? "de ayer" : (esPasado ? "acumulado" : "de hoy");

              return (
                <tr key={row.dia}>
                  <td style={styles.td} data-label="Fecha">
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: '#717274' }}>
                      {formatearFechaLarga(row.fecha)} <br/>
                      {tagFecha && (
                        <span style={{ 
                          fontSize: '10px', 
                          color: esHoy ? '#27ae60' : '#3498db', 
                          fontWeight: 'bold',
                          background: esHoy ? '#e8f5e9' : '#e1f5fe',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {tagFecha}
                        </span>
                      )}
                    </span>
                  </td>
                  
                  <td style={styles.td} data-label={labelBase}>
                    <div>
                      <strong>Q{row.baseFija.toFixed(2)}</strong>
                      {row.ingresosHoy > 0 && <span style={styles.badgeExtra}>🚀 +Q{row.ingresosHoy.toFixed(2)} extra</span>}
                    </div>
                  </td>

                  <td style={{ ...styles.td, backgroundColor: esReducido ? '#fff3cd' : '#e8f5e9' }} data-label={labelDisponible}>
                    <div>
                      <strong style={{fontSize: '1rem'}}>Q{row.disponibleDelDia.toFixed(2)}</strong>
                      <div style={{ fontSize: '10px', marginTop: '3px', lineHeight: '1.1', opacity: 0.8 }}>
                        Q{row.baseFija.toFixed(2)} base {sobranteAyer >= 0 ? '+' : ''} Q{sobranteAyer.toFixed(2)} {textoAhorro}
                      </div>
                      {esReducido && esHoy && (
                        <span style={{fontSize:'10px', color:'#856404', fontWeight:'bold', display:'block', marginTop:'2px'}}>
                          ⚠️ Saldo recortado
                        </span>
                      )}
                    </div>
                  </td>

                  <td 
                    onClick={() => setSelectedDate(row.fecha)}
                    style={{ ...styles.td, cursor: 'pointer', backgroundColor: statusGasto === 'good' ? '#d4edda' : (statusGasto === 'warn' ? '#ffeeba' : (statusGasto === 'danger' ? '#f8d7da' : 'transparent')) }} 
                    data-label={labelGasto}
                  >
                    <div>
                      <strong>Q{row.gastosHoy.toFixed(2)}</strong>
                      <span style={{fontSize:'10px', fontWeight:'bold'}}>{msjGasto} {row.gastosHoy > 0 && '🔍'}</span>
                    </div>
                  </td>

                  <td style={{ ...styles.td, backgroundColor: row.restanteDelDia < 0 ? '#e74c3c' : '#fffde7', color: row.restanteDelDia < 0 ? 'white' : 'black' }} data-label={labelRestante}>
                    <div>
                      <strong>Q{row.restanteDelDia.toFixed(2)}</strong>
                      {row.restanteDelDia < 0 && <span style={{fontSize:'9px', fontWeight:'bold'}}>💸 En deuda</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ExpenseModal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} date={selectedDate} expenses={expenses} onDelete={deleteExpense} />
    </div>
  );
};

const styles = {
  th: { padding: '12px 5px', fontSize: '11px', borderBottom: '2px solid #2c3e50', textAlign: 'center' },
  td: { padding: '12px 5px', textAlign: 'center', borderBottom: '1px solid #eee' },
  badgeExtra: { fontSize: '9px', color: '#155724', fontWeight: 'bold', display: 'block' }
};

export default BudgetTable;