import React, { useState } from "react";
import { addTransaction } from "../services/budgetService";

const AddExpenseForm = ({ cycleId, baseDiaria, disponibleHoy }) => {
  const [formData, setFormData] = useState({
    monto: "", motivo: "", metodo: "Efectivo", tipo: "gasto",
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(formData.monto);
    
    if (formData.tipo === "gasto" && montoNum > disponibleHoy) {
      if (!window.confirm(`⚠️ Excedes tu disponible. ¿Continuar?`)) return;
    }

    try {
      await addTransaction(cycleId, formData);
      // MENSAJE DE CONFIRMACIÓN AÑADIDO
      alert("✅ Registro guardado exitosamente");
      setFormData({ ...formData, monto: "", motivo: "" });
    } catch (error) {
      alert("❌ Error al guardar el registro");
    }
  };

  return (
    <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <form onSubmit={handleSubmit} className="form-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <input type="number" placeholder="Q 0.00" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} required style={styles.input} />
        <input type="text" placeholder="¿En qué?" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} required style={styles.input} />
        <select value={formData.metodo} onChange={e => setFormData({...formData, metodo: e.target.value})} style={styles.input}>
          <option value="Efectivo">💵 Efectivo.</option>
          <option value="Tarjeta">💳 Tarjeta.</option>
        </select>
        <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} style={{ ...styles.input, backgroundColor: formData.tipo === 'ingreso' ? '#d4edda' : '#f8d7da' }}>
          <option value="gasto">🔻 Gasto</option>
          <option value="ingreso">++ Ingreso</option>
        </select>
        <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} style={styles.input} />
        <button type="submit" className="btn-submit" style={styles.btn}>Guardar</button>
      </form>
    </div>
  );
};

const styles = {
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', flex: '1', minWidth: '80px' },
  btn: { padding: '12px 20px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AddExpenseForm;