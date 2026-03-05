import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CreateCycle from "./components/CreateCycle";
import BudgetTable from "./components/BudgetTable";
import AddExpenseForm from "./components/AddExpenseForm";
import DashboardAlerts from "./components/DashboardAlerts";

// Importación de Servicios y Hooks
import { 
  getCyclesByUser, 
  subscribeToExpenses, 
  closeCycle, 
  getActiveCycle, 
  getClosedCycles,
  deleteCycle 
} from "./services/budgetService";
import { useBudgetCalculator } from "./hooks/useBudgetCalculator";
import { generatePDFReport } from "./services/reportService";

function App() {
  const { user, logout } = useAuth();
  const [allCycles, setAllCycles] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [history, setHistory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [showFullProjection, setShowFullProjection] = useState(false);
  const [showFijos, setShowFijos] = useState(false);

  const initApp = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all = await getCyclesByUser(user.uid);
      const closed = await getClosedCycles(user.uid);
      setAllCycles(all);
      setHistory(closed);
      setView("list");
      setActiveCycle(null); 
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { initApp(); }, [user]);

  useEffect(() => {
    if (activeCycle) return subscribeToExpenses(activeCycle.id, (data) => setExpenses(data));
  }, [activeCycle]);

  // FUNCIÓN PARA ELIMINAR
  const handleDeleteCycle = async (id) => {
    if (window.confirm("❗ ¿Estás seguro de ELIMINAR permanentemente este presupuesto?")) {
      await deleteCycle(id);
      initApp();
    }
  };

  const tableData = useBudgetCalculator(activeCycle, expenses);
  const totalGastadoReal = expenses.filter(e => e.tipo === 'gasto' || !e.tipo).reduce((a, b) => a + Number(b.monto), 0);
  const totalIngresadoReal = expenses.filter(e => e.tipo === 'ingreso').reduce((a, b) => a + Number(b.monto), 0);
  const saldoGlobalAbsoluto = activeCycle ? (activeCycle.montoInicial + totalIngresadoReal) - totalGastadoReal : 0;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayIndex = tableData.findIndex(d => d.fecha === todayStr);
  const todayData = todayIndex !== -1 ? tableData[todayIndex] : (tableData.length > 0 ? tableData[0] : null);
  const displayData = showFullProjection ? tableData : tableData.slice(Math.max(0, todayIndex), todayIndex + 2);
  const isReadOnly = activeCycle?.estado === "cerrado";

  if (!user) return <Login />;
  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Cargando...</div>;

  if (view === "form") {
    return <div className="main-app-container"><CreateCycle userId={user.uid} onCreated={initApp} onCancel={() => setView("list")} editingCycle={activeCycle} /></div>;
  }

  // --- VISTA LISTA ---
  if (view === "list") {
    return (
      <div className="main-app-container">
        <nav className="navbar">
          <div className="nav-top">
            <div className="nav-brand-box">💰 MIS PRESUPUESTOS</div>
            <div className="nav-user-box">
              <span className="nav-name-text">👤 {user.displayName}</span>
              <button onClick={logout} className="btn-salir-nav">Salir</button>
            </div>
          </div>
        </nav>
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
          <button onClick={() => { setActiveCycle(null); setView("form"); }} style={styles.btnNew}>+ Crear Nuevo Presupuesto</button>
          <h3 style={{marginTop:'30px', color:'#2c3e50'}}>Activos</h3>
          {allCycles.filter(c => c.estado === 'activo').map(c => (
            <div key={c.id} style={styles.cycleCard}>
              <div style={{flex:1}}><strong>{c.nombre}</strong><br/><small>Q{c.montoInicial.toFixed(2)}</small></div>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={() => { setActiveCycle(c); setView("dashboard"); }} style={styles.btnBlue}>Entrar</button>
                <button onClick={() => handleDeleteCycle(c.id)} style={styles.btnDelIcon}>🗑️</button>
              </div>
            </div>
          ))}
          <h3 style={{marginTop:'40px', color:'#7f8c8d'}}>Historial</h3>
          {history.map(c => (
            <div key={c.id} style={{...styles.cycleCard, opacity: 0.6}}>
              <div style={{flex:1}}><strong>{c.nombre}</strong><br/><small>{c.fechaInicio}</small></div>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={() => { setActiveCycle(c); setView("dashboard"); }} style={styles.btnGray}>Ver</button>
                <button onClick={() => handleDeleteCycle(c.id)} style={styles.btnDelIcon}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA DASHBOARD (CORREGIDA) ---
  return (
    <div className="main-app-container">
      <nav className="navbar">
        <div className="nav-top">
          <div className="nav-brand-box">📊 {activeCycle.nombre}</div>
          <div className="nav-user-box">
            <span className="nav-name-text">👤 {user.displayName}</span>
            <button onClick={logout} className="btn-salir-nav">Salir</button>
          </div>
        </div>
        <div className="nav-bottom">
          <button onClick={() => setView("list")} className="btn-nav-action">⬅ Menú de Selección</button>
          {isReadOnly && <button onClick={initApp} className="btn-nav-action" style={{background:'#27ae60'}}>🏠 Volver a Hoy</button>}
        </div>
      </nav>

      <div style={{ marginTop: '15px' }}>
        <div style={styles.compactCard}>
          <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'10px'}}>
             <div style={{fontSize: '0.95rem'}}>💰 Ingreso: <strong>Q{activeCycle.ingresoTotal?.toFixed(2)}</strong></div>
             {/* ETIQUETA RESTAURADA: GASTOS FIJOS */}
             <div style={{fontSize: '0.95rem', color: '#e74c3c'}}>🛑 Gastos Fijos: <strong>-Q{(activeCycle.ingresoTotal - activeCycle.montoInicial).toFixed(2)}</strong></div>
          </div>
          {activeCycle.gastosFijos?.length > 0 && (
            <div style={styles.compactFijosList}>
              <button onClick={() => setShowFijos(!showFijos)} style={styles.btnLink}>{showFijos ? 'Ocultar fijos' : 'Ver detalle gastos fijos'}</button>
              {showFijos && activeCycle.gastosFijos.map((g, idx) => <div key={idx} style={{fontSize:'11px', color:'#666'}}>• {g.motivo}: Q{parseFloat(g.monto).toFixed(2)}</div>)}
            </div>
          )}
          <div style={styles.highlightNeto}>
            <div style={{fontSize: '1.1rem', color: '#1b5e20'}}>🎯 Neto Libre: <strong>Q{activeCycle.montoInicial.toFixed(2)}</strong></div>
            <div style={{fontSize: '0.8rem'}}>Plan de {activeCycle.diasTotales} días (Q{activeCycle.baseDiariaFija.toFixed(2)}/día).</div>
          </div>
          {!isReadOnly && (
            <div style={{marginTop:'12px', display:'flex', gap:'8px'}}>
              <button onClick={() => setView("form")} style={styles.btnSmall}>⚙️ Modificar ciclo</button>
              <button onClick={async () => {if(window.confirm("¿Cerrar?")){await closeCycle(activeCycle.id); initApp();}}} style={{...styles.btnSmall, color:'#cf1322'}}>🚩 Finalizar ciclo</button>
              {/* BOTÓN ELIMINAR RESTAURADO EN PANEL */}
              <button onClick={() => handleDeleteCycle(activeCycle.id)} style={{...styles.btnSmall, color:'#666'}}>🗑️ Eliminar</button>
            </div>
          )}
        </div>

        <DashboardAlerts todayData={todayData} baseFija={activeCycle.baseDiariaFija} saldoGlobalReal={saldoGlobalAbsoluto} />
        {!isReadOnly && <AddExpenseForm cycleId={activeCycle.id} baseDiaria={todayData?.baseFija || activeCycle.baseDiariaFija} disponibleHoy={todayData?.restanteDelDia || 0} />}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <h4 style={{margin: 0, fontSize: '0.9rem'}}>Historial del periodo</h4>
          <div style={{display:'flex', gap:'6px'}}>
            <button onClick={() => generatePDFReport(activeCycle, tableData, user)} style={styles.btnPDF}>PDF</button>
            <button onClick={() => setShowFullProjection(!showFullProjection)} style={styles.btnBlueRound}>{showFullProjection ? "Hoy" : "Todo"}</button>
          </div>
        </div>
        <BudgetTable expenses={expenses} displayData={isReadOnly ? tableData : displayData} todayStr={todayStr} />
      </div>
    </div>
  );
}

const styles = {
  btnNew: { width: '100%', padding: '15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  cycleCard: { background: 'white', padding: '12px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  btnBlue: { background: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight:'bold', fontSize: '11px' },
  btnGray: { background: '#95a5a6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px' },
  btnDelIcon: { background: '#fff1f0', border: '1px solid #ffa39e', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  compactCard: { background: 'white', borderRadius: '12px', padding: '15px', marginBottom: '15px', borderLeft: '6px solid #3498db', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  compactFijosList: { margin: '8px 0', padding: '8px', background: '#f8f9fa', borderRadius: '8px' },
  highlightNeto: { marginTop: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '8px' },
  btnSmall: { background: '#f8f9fa', border: '1px solid #ddd', padding: '5px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' },
  btnLink: { background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', fontSize: '10px', cursor:'pointer', marginBottom: '5px' },
  btnPDF: { border: '1px solid #27ae60', background: 'white', color: '#27ae60', padding: '8px 15px', borderRadius: '25px', fontWeight: 'bold', fontSize: '11px' },
  btnBlueRound: { background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '25px', fontWeight: 'bold', fontSize: '11px' }
};

export default App;