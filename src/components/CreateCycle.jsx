import React, { useState, useEffect } from "react";
import { createNewCycle, updateCycle } from "../services/budgetService";

const CreateCycle = ({ userId, onCreated, editingCycle = null, onCancel }) => {
  const [nombre, setNombre] = useState("");
  const [ingresoTotal, setIngresoTotal] = useState("");
  const [listaPagos, setListaPagos] = useState([]);
  const [nuevoPago, setNuevoPago] = useState({ motivo: "", monto: "" });
  const [dias, setDias] = useState(15);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingCycle) {
      setNombre(editingCycle.nombre || "");
      setIngresoTotal(editingCycle.ingresoTotal || "");
      setListaPagos(editingCycle.gastosFijos || []);
      setDias(editingCycle.diasTotales);
      setFechaInicio(editingCycle.fechaInicio);
    } else {
      setNombre("Ciclo " + new Date().toLocaleDateString());
      setIngresoTotal("");
      setListaPagos([]);
      setDias(15);
      setFechaInicio(new Date().toISOString().split('T')[0]);
    }
  }, [editingCycle]);

  // --- LÓGICA DE CÁLCULO DE FECHA FINAL ---
  const obtenerFechaFinal = () => {
    if (!fechaInicio || !dias) return "";
    const [y, m, d] = fechaInicio.split("-").map(Number);
    // Restamos 1 al día porque el día de inicio cuenta como el primer día del ciclo
    const fFinal = new Date(y, m - 1, d + (parseInt(dias) - 1));
    
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${fFinal.getDate()} de ${meses[fFinal.getMonth()]} de ${fFinal.getFullYear()}`;
  };

  const totalPagosFijos = listaPagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  const netoDisponible = parseFloat(ingresoTotal || 0) - totalPagosFijos;

  const agregarPagoFijo = () => {
    if (!nuevoPago.motivo || !nuevoPago.monto) return;
    setListaPagos([...listaPagos, { ...nuevoPago, id: Date.now() }]);
    setNuevoPago({ motivo: "", monto: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nombre,
      ingresoTotal: parseFloat(ingresoTotal),
      gastosFijos: listaPagos,
      monto: netoDisponible, 
      dias: parseInt(dias),
      fechaInicio
    };

    try {
      if (editingCycle) {
        await updateCycle(editingCycle.id, data);
        alert("✅ Cambios guardados");
      } else {
        await createNewCycle(userId, data);
        alert("🚀 Nuevo presupuesto creado");
      }
      onCreated();
    } catch (error) { alert("Error al guardar"); }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px', fontSize: '1.4rem' }}>
        {editingCycle ? "⚙️ Modificar Planeación" : "🚀 Crear Nuevo Presupuesto"}
      </h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* PASO 1 */}
        <div style={styles.section}>
          <label style={styles.label}>1. Identificación e Ingreso Total</label>
          <input placeholder="Nombre del Ciclo" onChange={e => setNombre(e.target.value)} required style={styles.input} />
          <input type="number" placeholder="Ingreso Total Q" value={ingresoTotal} onChange={e => setIngresoTotal(e.target.value)} required style={styles.input} />
        </div>

        {/* PASO 2 */}
        <div style={styles.section}>
          <label style={styles.label}>2. Gastos Fijos (Renta, etc)</label>
          <div style={styles.fijosInputGroup}>
            <input 
              placeholder="Motivo" 
              value={nuevoPago.motivo} 
              onChange={e => setNuevoPago({...nuevoPago, motivo: e.target.value})} 
              style={{ ...styles.input, marginBottom: 0, flex: 2 }} 
            />
            <input 
              type="number" 
              placeholder="Q" 
              value={nuevoPago.monto} 
              onChange={e => setNuevoPago({...nuevoPago, monto: e.target.value})} 
              style={{ ...styles.input, marginBottom: 0, flex: 1, minWidth: '60px' }} 
            />
            <button type="button" onClick={agregarPagoFijo} style={styles.btnAdd}>+</button>
          </div>
          <div style={{ marginTop: '10px' }}>
            {listaPagos.map(p => (
              <div key={p.id} style={styles.pagoItem}>
                <span style={{ fontSize: '11px' }}>{p.motivo}: <strong>Q{parseFloat(p.monto).toFixed(2)}</strong></span>
                <button type="button" onClick={() => setListaPagos(listaPagos.filter(x => x.id !== p.id))} style={styles.btnDel}>x</button>
              </div>
            ))}
          </div>
        </div>

        {/* PASO 3 */}
        <div style={styles.summary}>
          <div style={styles.summaryRow}><span>Ingreso:</span> <span>Q{parseFloat(ingresoTotal || 0).toFixed(2)}</span></div>
          <div style={styles.summaryRow}><span>Fijos:</span> <span style={{color:'#e74c3c'}}>-Q{totalPagosFijos.toFixed(2)}</span></div>
          <div style={{...styles.summaryRow, borderTop: '1px solid #ccc', marginTop: '5px', paddingTop: '5px', fontWeight: 'bold'}}>
            <span>LIBRE:</span> <span style={{color:'#27ae60'}}>Q{netoDisponible.toFixed(2)}</span>
          </div>
        </div>

        {/* PASO 4: TIEMPO Y FECHA FINAL */}
        <div style={styles.section}>
          <label style={styles.label}>3. Tiempo y Proyección de Cierre</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
             <div style={{ flex: 1 }}>
               <small style={{ fontSize: '10px' }}>Días:</small>
               <input type="number" value={dias} onChange={e => setDias(e.target.value)} required style={{ ...styles.input, marginTop: '2px' }} />
             </div>
             <div style={{ flex: 2 }}>
               <small style={{ fontSize: '10px' }}>Inicio:</small>
               <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required style={{ ...styles.input, marginTop: '2px' }} />
             </div>
          </div>
          
          {/* MUESTRA DE FECHA FINAL CALCULADA */}
          <div style={styles.endDateBox}>
            🏁 El ciclo terminará el: <br/>
            <strong>{obtenerFechaFinal()}</strong>
          </div>
        </div>

        <button type="submit" style={styles.btnSave}>{editingCycle ? "Guardar Cambios" : "Crear Ahora"}</button>
        <button type="button" onClick={onCancel} style={styles.btnCancel}>Cancelar / Volver</button>
      </form>
    </div>
  );
};

const styles = {
  card: { width: '100%', maxWidth: '450px', margin: '10px auto', padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  section: { borderBottom: '1px dashed #eee', paddingBottom: '10px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', display: 'block', marginBottom: '5px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '8px', boxSizing: 'border-box', fontSize: '14px' },
  fijosInputGroup: { display: 'flex', gap: '5px', alignItems: 'center', width: '100%' },
  btnAdd: { background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', height: '40px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' },
  pagoItem: { display: 'flex', justifyContent: 'space-between', background: '#f9f9f9', padding: '8px 10px', borderRadius: '8px', marginBottom: '5px', border: '1px solid #f0f0f0' },
  btnDel: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', padding: '0 5px' },
  summary: { background: '#f4f7f6', padding: '15px', borderRadius: '10px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' },
  endDateBox: { background: '#fff9db', padding: '10px', borderRadius: '8px', border: '1px solid #ffec99', color: '#856404', fontSize: '12px', textAlign: 'center' },
  btnSave: { padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
  btnCancel: { background: 'none', border: 'none', color: '#95a5a6', cursor: 'pointer', fontSize: '13px', textAlign: 'center', marginTop: '5px' }
};

export default CreateCycle;