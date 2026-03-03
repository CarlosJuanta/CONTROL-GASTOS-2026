import { useState } from "react";
import { createNewCycle } from "../services/budgetService";

const CreateCycle = ({ userId, onCreated }) => {
  const [formData, setFormData] = useState({
    monto: 1000,
    dias: 15,
    fechaInicio: new Date().toISOString().split('T')[0]
  });

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Aseguramos que los valores sean numéricos antes de enviarlos
    const dataAEnviar = {
      ...formData,
      monto: Number(formData.monto),
      dias: Number(formData.dias)
    };

    await createNewCycle(userId, dataAEnviar);
    onCreated(); 
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h3>Iniciar Nuevo Ciclo</h3>
      <form onSubmit={handleSubmit}>
        <label>¿Cuánto tienes para gastar? (Q)</label>
        <input type="number" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} required />
        
        <label>¿Para cuántos días?</label>
        <input type="number" value={formData.dias} onChange={e => setFormData({...formData, dias: e.target.value})} required />
        
        <label>Fecha de inicio</label>
        <input type="date" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} required />
        
        <button type="submit" style={{ marginTop: '10px', width: '100%' }}>Crear Ciclo</button>
      </form>
    </div>
  );
};

export default CreateCycle;