import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CreateCycle from "./components/CreateCycle";
import BudgetTable from "./components/BudgetTable";
import AddExpenseForm from "./components/AddExpenseForm";
import DashboardAlerts from "./components/DashboardAlerts";

// Servicios e Hooks
import { getActiveCycle, subscribeToExpenses } from "./services/budgetService";
import { useBudgetCalculator } from "./hooks/useBudgetCalculator";
import { generatePDFReport } from "./services/reportService";

function App() {
  const { user, logout } = useAuth();
  const [activeCycle, setActiveCycle] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullProjection, setShowFullProjection] = useState(false);

  // 1. Cargar el ciclo activo y suscribirse a las transacciones en tiempo real
  useEffect(() => {
    if (!user) return;

    let unsubscribeExpenses = () => {};

    const initApp = async () => {
      setLoading(true);
      try {
        const cycle = await getActiveCycle(user.uid);
        setActiveCycle(cycle);
        
        if (cycle) {
          // Suscripción en tiempo real a la colección de gastos/ingresos
          unsubscribeExpenses = subscribeToExpenses(cycle.id, (data) => {
            setExpenses(data);
          });
        }
      } catch (error) {
        console.error("Error al inicializar la app:", error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
    return () => unsubscribeExpenses();
  }, [user]);

  // 2. Procesar todos los datos financieros usando el Hook de cálculo
  const tableData = useBudgetCalculator(activeCycle, expenses);

  // 3. Determinar qué fila corresponde a HOY para las alertas
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const todayIndex = tableData.findIndex(d => d.fecha === todayStr);
  // Si no encuentra el día (ej. fuera de rango), usa el primero por defecto
  const todayData = todayIndex !== -1 ? tableData[todayIndex] : tableData[0];

  // 4. Filtrar datos para la tabla según la vista seleccionada (Resumida o Completa)
  const displayData = showFullProjection 
    ? tableData 
    : tableData.slice(Math.max(0, todayIndex), todayIndex + 2);

  // Pantallas de carga y Login
  if (!user) return <Login />;
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Cargando tu presupuesto...</h2>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* BARRA DE NAVEGACIÓN */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 2rem', 
        background: '#2c3e50', 
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <span style={{ fontSize: '1.4em', fontWeight: 'bold' }}>💰 Control de Gastos 2026</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Bienvenido, <strong>{user.displayName}</strong></span>
          <button 
            onClick={logout} 
            style={{ 
              background: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >Cerrar Sesión</button>
        </div>
      </nav>
      
      {!activeCycle ? (
        // Pantalla para crear ciclo si no hay uno activo
        <CreateCycle userId={user.uid} onCreated={() => window.location.reload()} />
      ) : (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
          
          {/* TARJETA DE DESCRIPCIÓN DEL CICLO */}
          <div style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '10px', 
            borderLeft: '6px solid #3498db', 
            marginBottom: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>Configuración del Ciclo</h4>
            <p style={{ margin: 0, fontSize: '1.15em', color: '#2c3e50' }}>
              🎯 Este ciclo inició con un global de <strong>Q{activeCycle.montoInicial.toFixed(2)}</strong> para 
              <strong> {activeCycle.diasTotales} días</strong>, con una base diaria original de 
              <strong> Q{activeCycle.baseDiariaFija.toFixed(2)}</strong>.
            </p>
          </div>

          {/* ALERTAS DE EQUILIBRIO Y RESUMEN DE HOY */}
          <DashboardAlerts 
            todayData={todayData} 
            baseFija={todayData?.baseFija || activeCycle.baseDiariaFija} 
          />

          {/* FORMULARIO PARA AGREGAR GASTOS O INGRESOS EXTRA */}
          <AddExpenseForm 
            cycleId={activeCycle.id} 
            baseDiaria={todayData?.baseFija || activeCycle.baseDiariaFija}
            disponibleHoy={todayData?.disponibleDelDia || 0}
          />

          {/* BARRA DE ACCIONES (REPORTES Y VISTAS) */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            margin: '30px 0 15px 0',
            borderBottom: '2px solid #ddd',
            paddingBottom: '12px'
          }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>
              {showFullProjection ? "📅 Historial Completo" : "📱 Resumen del Día"}
            </h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* BOTÓN PARA GENERAR PDF */}
              <button 
                onClick={() => generatePDFReport(activeCycle, tableData, user)}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '25px', 
                  border: '2px solid #27ae60', 
                  background: '#fff', 
                  color: '#27ae60', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📄 Descargar Reporte PDF
              </button>

              {/* BOTÓN TOGGLE VISTA */}
              <button 
                onClick={() => setShowFullProjection(!showFullProjection)} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '25px', 
                  border: 'none', 
                  background: '#3498db', 
                  color: 'white', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {showFullProjection ? "👁️ Ver solo hoy" : "🔍 Ver proyección completa"}
              </button>
            </div>
          </div>

          {/* TABLA PRINCIPAL DE DATOS */}
          <BudgetTable 
            cycle={activeCycle} 
            expenses={expenses} 
            displayData={displayData}
          />
        </div>
      )}
    </div>
  );
}

export default App;