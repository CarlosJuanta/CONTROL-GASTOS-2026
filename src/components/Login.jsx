import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Control de Gastos 2026</h1>
      <p>Bienvenido. Por favor, inicia sesión para gestionar tus gastos.</p>
      <button 
        onClick={handleLogin}
        style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}
      >
        Entrar con Google
      </button>
    </div>
  );
};

export default Login;