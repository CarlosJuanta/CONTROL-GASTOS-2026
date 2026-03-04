import React, { useState } from "react";
import ExpenseModal from "./ExpenseModal";
import { deleteExpense } from "../services/budgetService";

const BudgetTable = ({ expenses, displayData }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  if (!displayData || displayData.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {/* CONTENEDOR CON SCROLL LIMITADO A 2-3 TARJETAS */}
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
              const esReducido = row.disponibleDelDia < row.baseFija;
              const statusGasto = row.gastosHoy <= 0 ? 'none' : (row.gastosHoy <= row.baseFija ? 'good' : (row.gastosHoy <= row.disponibleDelDia ? 'warn' : 'danger'));
              
              let msjGasto = statusGasto === 'good' ? "✅ Bajo base" : statusGasto === 'warn' ? "🧱 Usando ahorro" : statusGasto === 'danger' ? "🚨 Exceso" : "";

              return (
                <tr key={row.dia}>
                  <td style={styles.td} data-label="Fecha">
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2c3e50' }}>
                      {row.fecha}
                    </span>
                  </td>
                  
                  <td style={styles.td} data-label="Base Diaria">
                    <div>
                      <strong>Q{row.baseFija.toFixed(2)}</strong>
                      {row.ingresosHoy > 0 && <span style={styles.badgeExtra}>🚀 +Q{row.ingresosHoy.toFixed(2)}</span>}
                    </div>
                  </td>

                  <td style={{ ...styles.td, backgroundColor: esReducido ? '#fff3cd' : '#e8f5e9' }} data-label="Disponible hoy">
                    <div>
                      <strong>Q{row.disponibleDelDia.toFixed(2)}</strong>
                      {esReducido && <span style={{fontSize:'9px', color:'#856404', fontWeight:'bold'}}>⚠️ Saldo recortado</span>}
                    </div>
                  </td>

                  <td 
                    onClick={() => setSelectedDate(row.fecha)}
                    style={{ ...styles.td, cursor: 'pointer', backgroundColor: statusGasto === 'good' ? '#d4edda' : (statusGasto === 'warn' ? '#ffeeba' : (statusGasto === 'danger' ? '#f8d7da' : 'transparent')) }} 
                    data-label="Gastos realizados"
                  >
                    <div>
                      <strong>Q{row.gastosHoy.toFixed(2)}</strong>
                      <span style={{fontSize:'10px', fontWeight:'bold'}}>{msjGasto} {row.gastosHoy > 0 && '🔍'}</span>
                    </div>
                  </td>

                  <td style={{ ...styles.td, backgroundColor: row.restanteDelDia < 0 ? '#e74c3c' : '#fffde7', color: row.restanteDelDia < 0 ? 'white' : 'black' }} data-label="Queda para mañana">
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
  badgeExtra: { fontSize: '9px', color: '#155724', fontWeight: 'bold' }
};

export default BudgetTable;