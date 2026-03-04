import React, { useState, useEffect } from "react";
import { createNewCycle, updateCycle } from "../services/budgetService";

const CreateCycle = ({ userId, onCreated, editingCycle = null, onCancel }) => {
  const [formData, setFormData] = useState({
    monto: 1000,
    dias: 15,
    fechaInicio: new Date().toISOString().split('T')[0]
  });

  // Si estamos editando, cargamos los valores actuales
  useEffect(() => {
    if (editingCycle) {
      setFormData({
        monto: editingCycle.montoInicial,
        dias: editingCycle.diasTotales,
        fechaInicio: editingCycle.fechaInicio
      });
    }
  }, [editingCycle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCycle) {
        await updateCycle(editingCycle.id, formData);
        alert("✅ Ciclo actualizado correctamente");
      } else {
        await createNewCycle(userId, formData);
        alert("✅ Nuevo ciclo creado");
      }
      onCreated(); // Refrescar App.jsx
    } catch (error) {
      alert("Error al procesar el ciclo");
    }
  };

  return (
    <div style={{ 
      maxWidth: '450px', 
      margin: '40px auto', 
      padding: '30px', 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '25px' }}>
        {editingCycle ? "⚙️ Modificar Ciclo Activo" : "🚀 Iniciar Nuevo Ciclo"}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={styles.label}>¿Monto total disponible? (Q)</label>
          <input 
            type="number" 
            value={formData.monto} 
            onChange={e => setFormData({...formData, monto: e.target.value})} 
            required 
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>¿Duración del ciclo? (Días)</label>
          <input 
            type="number" 
            value={formData.dias} 
            onChange={e => setFormData({...formData, dias: e.target.value})} 
            required 
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Fecha de inicio</label>
          <input 
            type="date" 
            value={formData.fechaInicio} 
            onChange={e => setFormData({...formData, fechaInicio: e.target.value})} 
            required 
            style={styles.input}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={styles.btnPrimary}>
            {editingCycle ? "Guardar Cambios" : "Crear Ciclo Ahora"}
          </button>
          
          {editingCycle && (
            <button type="button" onClick={onCancel} style={styles.btnSecondary}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const styles = {
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '14px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  btnPrimary: { flex: 2, padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  btnSecondary: { flex: 1, padding: '15px', background: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};

export default CreateCycle;