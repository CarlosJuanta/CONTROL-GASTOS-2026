import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CreateCycle from "./components/CreateCycle";
import BudgetTable from "./components/BudgetTable";
import AddExpenseForm from "./components/AddExpenseForm";
import DashboardAlerts from "./components/DashboardAlerts";

import { getActiveCycle, subscribeToExpenses, closeCycle, getClosedCycles } from "./services/budgetService";
import { useBudgetCalculator } from "./hooks/useBudgetCalculator";
import { generatePDFReport } from "./services/reportService";

function App() {
  const { user, logout } = useAuth();
  const [activeCycle, setActiveCycle] = useState(null);
  const [history, setHistory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [showFullProjection, setShowFullProjection] = useState(false);

  const initApp = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const cycle = await getActiveCycle(user.uid);
      const closedCycles = await getClosedCycles(user.uid);
      setActiveCycle(cycle);
      setHistory(closedCycles);
      setView("dashboard");
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { initApp(); }, [user]);

  useEffect(() => {
    if (activeCycle) return subscribeToExpenses(activeCycle.id, (data) => setExpenses(data));
  }, [activeCycle]);

  const tableData = useBudgetCalculator(activeCycle, expenses);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayIndex = tableData.findIndex(d => d.fecha === todayStr);
  const todayData = todayIndex !== -1 ? tableData[todayIndex] : (tableData.length > 0 ? tableData[0] : null);
  const displayData = showFullProjection ? tableData : tableData.slice(Math.max(0, todayIndex), todayIndex + 2);
  const isReadOnly = activeCycle?.estado === "cerrado";

  if (!user) return <Login />;
  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Cargando...</div>;

  if (activeCycle && view === "edit") {
    return <div className="main-app-container"><CreateCycle userId={user.uid} editingCycle={activeCycle} onCreated={initApp} onCancel={() => setView("dashboard")} /></div>;
  }

  if (view === "history") {
    return (
      <div className="main-app-container">
        <nav className="navbar">
          <div className="nav-mobile-top">
             <button onClick={() => setView("dashboard")} style={{background:'transparent', color:'white', border:'1px solid white', borderRadius:'6px', padding:'5px 10px', cursor:'pointer'}}>⬅ Volver</button>
             <span style={{fontWeight:'bold'}}>HISTORIAL</span>
          </div>
        </nav>
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
          {history.map(c => (
            <div key={c.id} style={{background:'white', padding:'15px', borderRadius:'8px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
              <div><strong>{c.fechaInicio}</strong><br/><small>Q{c.montoInicial.toFixed(2)}</small></div>
              <button onClick={() => { setActiveCycle(c); setView("dashboard"); }} style={{background:'#3498db', color:'white', border:'none', padding:'8px 12px', borderRadius:'6px', cursor:'pointer'}}>Ver 👁️</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-app-container">
      <nav className="navbar">
        <div className="nav-mobile-top">
          <div className="nav-brand">
            <span>💰 MI CONTROL</span>
            {isReadOnly && <button onClick={initApp} style={{background:'#27ae60', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', fontSize:'11px', marginLeft:'10px', cursor:'pointer'}}>🏠 Hoy</button>}
          </div>
          <div className="nav-user-group">
            <span className="nav-username">👤 {user.displayName}</span> 
            <button style={{ marginLeft:'15px'}} onClick={() => setView("history")} className="btn-history-mobile">📜 Historial</button> 
          </div>
        </div>
        <div className="nav-mobile-bottom">
          <button onClick={logout} style={{background:'#e74c3c', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', marginLeft: '12px'}}>Salir</button>
        </div>
      </nav>

      <div style={{ marginTop: '20px' }}>
        {isReadOnly && <div style={{background:'#2c3e50', color:'white', padding:'10px', borderRadius:'8px', marginBottom:'15px', textAlign:'center', fontSize:'13px'}}>⚠️ Modo Lectura (Ciclo Finalizado)</div>}

        {!activeCycle ? (
          <CreateCycle userId={user.uid} onCreated={initApp} />
        ) : (
          <>
            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '6px solid #3498db', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '14px' }}>
               🎯 Presupuesto: <strong>Q{activeCycle.montoInicial.toFixed(2)}</strong> / {activeCycle.diasTotales} días.
               {!isReadOnly && (
                 <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                    <button onClick={() => setView("edit")} style={{background:'#f8f9fa', border:'1px solid #ddd', padding:'5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor:'pointer'}}>⚙️ Modificar</button>
                    <button onClick={async () => {if(window.confirm("¿Finalizar?")){await closeCycle(activeCycle.id); initApp();}}} style={{background:'#f8f9fa', border:'1px solid #ddd', color:'#e74c3c', padding:'5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor:'pointer'}}>🚩 Finalizar</button>
                 </div>
               )}
            </div>

            <DashboardAlerts 
              todayData={todayData} 
              baseFija={activeCycle.baseDiariaFija} 
              saldoGlobalReal={todayData?.disponibleGlobal || 0}
            />
            
            {!isReadOnly && <AddExpenseForm cycleId={activeCycle.id} baseDiaria={todayData?.baseFija || activeCycle.baseDiariaFija} disponibleHoy={todayData?.restanteDelDia || 0} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems:'center' }}>
              <h4 style={{margin:0, color:'#2c3e50'}}>{showFullProjection ? "📅 Ciclo Completo" : "📱 Resumen Hoy"}</h4>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={() => generatePDFReport(activeCycle, tableData, user)} style={{border:'2px solid #27ae60', background:'white', color:'#27ae60', padding:'8px 15px', borderRadius:'25px', fontWeight:'bold', fontSize:'12px', cursor:'pointer'}}>PDF</button>
                <button onClick={() => setShowFullProjection(!showFullProjection)} style={{background:'#3498db', color:'white', border:'none', padding:'8px 15px', borderRadius:'25px', fontWeight:'bold', fontSize:'12px', cursor:'pointer'}}>
                   {showFullProjection ? "👁️ Hoy" : "🔍 Todo"}
                </button>
              </div>
            </div>

            <BudgetTable cycle={activeCycle} expenses={expenses} displayData={isReadOnly ? tableData : displayData} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;