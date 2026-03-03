import React, { useState } from "react";
import { addTransaction } from "../services/budgetService";

const AddExpenseForm = ({ cycleId, baseDiaria, disponibleHoy }) => {
  const [formData, setFormData] = useState({
    monto: "",
    motivo: "",
    metodo: "Efectivo",
    tipo: "gasto",
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(formData.monto);

    if (formData.tipo === "gasto") {
      if (montoNum > disponibleHoy) {
        if (!window.confirm(`⚠️ Estás excediendo tu disponible (Q${disponibleHoy.toFixed(2)}). ¿Continuar?`)) return;
      } else if (montoNum > baseDiaria) {
        alert(`Nota: Superas tu base diaria de Q${baseDiaria.toFixed(2)}`);
      }
    }

    try {
      await addTransaction(cycleId, formData);
      setFormData({ ...formData, monto: "", motivo: "", tipo: "gasto" });
      alert("✅ Registrado con éxito");
    } catch (error) {
      alert("Error al guardar");
    }
  };

  return (
    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="number" placeholder="Q 0.00" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} required style={{ padding: '8px', width: '100px' }} />
        <input type="text" placeholder="¿En qué?" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} required style={{ padding: '8px' }} />
        <select value={formData.metodo} onChange={e => setFormData({...formData, metodo: e.target.value})} style={{ padding: '8px' }}>
          <option value="Efectivo">💵 Efectivo</option>
          <option value="Tarjeta">💳 Tarjeta</option>
        </select>
        <select 
          value={formData.tipo} 
          onChange={e => setFormData({...formData, tipo: e.target.value})} 
          style={{ padding: '8px', backgroundColor: formData.tipo === 'ingreso' ? '#d4edda' : '#f8d7da' }}
        >
          <option value="gasto">🔻 Gasto</option>
          <option value="ingreso">++ Ingreso Extra</option>
        </select>
        <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '8px 15px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
      </form>
    </div>
  );
};

export default AddExpenseForm;