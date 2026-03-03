import React from 'react';

const ExpenseModal = ({ isOpen, onClose, date, expenses, onDelete }) => {
  if (!isOpen) return null;

  // Filtramos los gastos que coinciden con la fecha seleccionada
  const filteredExpenses = expenses.filter(exp => exp.fecha === date);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      await onDelete(id);
    }
  };

  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000
    }}>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        minWidth: '320px', 
        maxWidth: '90%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        color: '#333'
      }}>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          Gastos del día: {date}
        </h3>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredExpenses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No hay gastos registrados este día.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredExpenses.map(exp => (
                <li key={exp.id} style={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  padding: '12px 0', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '1.1em' }}>{exp.motivo}</strong> <br />
                    <span style={{ color: '#666', fontSize: '0.9em' }}>
                      {exp.metodo} — <strong>Q{Number(exp.monto).toFixed(2)}</strong>
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(exp.id)} 
                    style={{ 
                      background: '#ff4d4d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button 
          onClick={onClose} 
          style={{ 
            marginTop: '20px', 
            width: '100%', 
            padding: '12px', 
            background: '#333', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ExpenseModal;