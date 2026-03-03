import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";

function App() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#eee' }}>
        <span>Bienvenido, <b>{user.displayName}</b></span>
        <button onClick={logout}>Cerrar Sesión</button>
      </nav>
      
      <main style={{ padding: '20px' }}>
        <h2>Panel de Control</h2>
        <p>Aquí construiremos la lógica de los 15 días.</p>
      </main>
    </div>
  );
}

export default App;