import React, { useState } from "react";
import { addTransaction } from "../services/budgetService";
import { interpretarGastoConIA } from "../services/aiService";

const AddExpenseForm = ({ cycleId, baseDiaria, disponibleHoy }) => {
  const [formData, setFormData] = useState({
    monto: "", motivo: "", metodo: "Efectivo", tipo: "gasto",
    fecha: new Date().toISOString().split('T')[0]
  });
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const ejecutarGuardado = async (datos) => {
    try {
      await addTransaction(cycleId, datos);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAiInterpret = async (e) => {
    if (e.key === "Enter" && aiInput.trim()) {
      e.preventDefault();

      // --- INICIO EASTER EGG ---
      if (aiInput.trim() === "090824") {
        alert("❤️ ¡Te amo mucho Mi Paolita! ❤️ ");
        setAiInput("");
        return;
      }
      // --- FIN EASTER EGG ---

      setIsAiLoading(true);
      
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const respuestaIA = await interpretarGastoConIA(aiInput, todayStr);
        
        if (respuestaIA?.error === "LIMIT_EXCEEDED") {
          alert("⚠️ Límite de IA alcanzado por hoy.");
          setIsAiLoading(false);
          return;
        }

        const listaTransacciones = Array.isArray(respuestaIA) ? respuestaIA : [];
        
        if (listaTransacciones.length === 0) {
          alert("🧐 Información insuficiente o no financiera.\n\nPor favor indica MONTO y MOTIVO claramente.\nEj: '5 panes de a 1.50' o 'gasté 20 en cena ayer'.");
          setIsAiLoading(false);
          return;
        }

        let contadorExitos = 0;
        for (const item of listaTransacciones) {
          // Validación de integridad del dato
          if (!item.monto || Number(item.monto) <= 0 || !item.motivo || item.motivo.length < 3) {
            alert(`⚠️ El registro "${item.motivo || 'inválido'}" no tiene suficiente información.`);
            continue;
          }

          const transaccion = { ...item };

          // Alerta de presupuesto (solo si es para hoy)
          if (transaccion.tipo === "gasto" && transaccion.monto > disponibleHoy && transaccion.fecha === todayStr) {
            const confirmar = window.confirm(`🤖 IA detectó: "${transaccion.motivo}" por Q${transaccion.monto.toFixed(2)}. Supera el disponible de hoy. ¿Guardar?`);
            if (!confirmar) continue;
          }

          const ok = await ejecutarGuardado(transaccion);
          if (ok) contadorExitos++;
        }

        if (contadorExitos > 0) {
          alert(`✅ ${contadorExitos} registros guardados exitosamente.`);
          setAiInput("");
          setFormData({ ...formData, monto: "", motivo: "" });
        }

      } catch (err) {
        alert("Error al procesar la respuesta. Intenta de nuevo.");
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(formData.monto);
    if (formData.tipo === "gasto" && montoNum > disponibleHoy) {
      if (!window.confirm(`⚠️ Excedes tu disponible. ¿Continuar?`)) return;
    }
    const ok = await ejecutarGuardado(formData);
    if (ok) {
      alert("✅ Guardado");
      setFormData({ ...formData, monto: "", motivo: "" });
    }
  };

  return (
    <div className="glass-card" style={{ padding: '15px', borderRadius: '12px', marginBottom: '20px', borderLeft: '6px solid #3498db' }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '10px', fontWeight: '900', color: '#3498db', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
          ✨ REGISTRO INTELIGENTE (Soporta fechas y cantidades)
        </label>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder={isAiLoading ? "Analizando..." : "Ej: compré 2 o dos libras de pollo"}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleAiInterpret}
            disabled={isAiLoading}
            style={{ 
              width: '100%', border: '2px solid #e1f5fe', padding: '12px', 
              borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none'
            }} 
          />
          {isAiLoading && <div style={{position:'absolute', right:'10px', top:'12px', fontSize:'12px', color:'#3498db', fontWeight:'bold'}}>🪄...</div>}
        </div>
      </div>

      <form onSubmit={handleManualSubmit} className="form-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <input type="number" step="0.01" placeholder="Q 0.00" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} required style={styles.input} />
        <input type="text" placeholder="¿En qué?" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} required style={styles.input} />
        <select value={formData.metodo} onChange={e => setFormData({...formData, metodo: e.target.value})} style={styles.input}><option value="Efectivo">💵 Efec.</option><option value="Tarjeta">💳 Tarj.</option></select>
        <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} style={{ ...styles.input, backgroundColor: formData.tipo === 'ingreso' ? '#d4edda' : '#f8d7da' }}><option value="gasto">🔻 Gasto</option><option value="ingreso">++ Ingreso</option></select>
        <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} style={styles.input} />
        <button type="submit" className="btn-submit" style={styles.btn}>Guardar</button>
      </form>
    </div>
  );
};

const styles = {
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', flex: '1', minWidth: '80px', fontSize: '14px', outline: 'none' },
  btn: { padding: '12px 20px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};

export default AddExpenseForm;