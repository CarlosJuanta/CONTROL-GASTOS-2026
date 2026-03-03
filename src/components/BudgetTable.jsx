import React, { useState } from "react";
import ExpenseModal from "./ExpenseModal";
import { deleteExpense } from "../services/budgetService";

const BudgetTable = ({ cycle, expenses, displayData }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  if (!displayData || displayData.length === 0) {
    return <p style={{ textAlign: 'center', padding: '20px' }}>No hay datos para mostrar.</p>;
  }

  return (
    <div style={{ 
      overflowX: 'auto', 
      marginTop: '10px', 
      borderRadius: '8px', 
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
    }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontSize: '14px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
            <th style={styles.th}>FECHA</th>
            <th style={styles.th}>BASE DIARIA</th>
            <th style={styles.th}>DISPONIBLE</th>
            <th style={styles.th}>GASTOS (ver)</th>
            <th style={styles.th}>RESTANTE HOY</th>
            <th style={styles.th}>GLOBAL</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((row) => (
            <tr key={row.dia} style={{ borderBottom: '1px solid #eee' }}>
              <td style={styles.td}>{row.fecha}</td>
              
              {/* COLUMNA BASE DIARIA CON CINTA DE DESCRIPCIÓN */}
              <td style={{ ...styles.td, position: 'relative' }}>
                <strong>Q{row.baseFija.toFixed(2)}</strong>
                {row.ingresosHoy > 0 && (
                  <div style={{
                    fontSize: '9px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    border: '1px solid #c3e6cb',
                    lineHeight: '1',
                    fontWeight: 'bold'
                  }}>
                    ⬆️ +Q{row.ingresosHoy.toFixed(2)} extra <br/>
                    Base y Global actualizados
                  </div>
                )}
              </td>
              
              <td style={{ ...styles.td, backgroundColor: '#e8f5e9', fontWeight: 'bold' }}>
                Q{row.disponibleDelDia.toFixed(2)}
              </td>
              
              <td 
                onClick={() => setSelectedDate(row.fecha)}
                style={{ 
                  ...styles.td, 
                  backgroundColor: row.gastosHoy > 0 ? '#ffebee' : 'transparent',
                  cursor: 'pointer',
                  color: row.gastosHoy > 0 ? '#c62828' : '#999',
                  textDecoration: row.gastosHoy > 0 ? 'underline' : 'none',
                  fontWeight: 'bold'
                }}
              >
                Q{row.gastosHoy.toFixed(2)}
              </td>

              <td style={{ 
                ...styles.td, 
                backgroundColor: row.restanteDelDia < 0 ? '#e74c3c' : '#fffde7',
                color: row.restanteDelDia < 0 ? 'white' : 'black',
                fontWeight: 'bold'
              }}>
                Q{row.restanteDelDia.toFixed(2)}
              </td>

              <td style={{ 
                ...styles.td, 
                backgroundColor: '#27ae60', 
                color: 'white', 
                fontWeight: 'bold' 
              }}>
                Q{row.disponibleGlobal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ExpenseModal 
        isOpen={!!selectedDate} 
        onClose={() => setSelectedDate(null)} 
        date={selectedDate} 
        expenses={expenses}
        onDelete={deleteExpense}
      />
    </div>
  );
};

const styles = {
  th: {
    padding: '12px 10px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  td: {
    padding: '12px 10px',
    textAlign: 'center',
    borderBottom: '1px solid #f0f0f0'
  }
};

export default BudgetTable;