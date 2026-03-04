import React from "react";
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
    <div className="login-container">
      <div className="login-card">
        {/* SECCIÓN IZQUIERDA: BIENVENIDA Y ACCESO */}
        <div className="login-auth-section">
          <div className="login-header">
            <span style={{ fontSize: '3rem' }}>💰</span>
            <h1>MI CONTROL 2026</h1>
            <p className="slogan">Gestión Inteligente de Presupuesto Diario</p>
          </div>

          <button onClick={handleLogin} className="google-btn">
            <img 
              src="data:image/png;base64,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" 
              alt="Google" 
            />
            Entrar con Google
          </button>
          
          <p className="footer-text">Acceso seguro con tu cuenta personal</p>

          {/* DERECHOS DE AUTOR AÑADIDOS AQUÍ */}
          <div style={{ marginTop: '40px', fontSize: '0.75rem', color: '#bdc3c7', fontWeight: '500' }}>
            © 2026 Carlos Juantá. Todos los derechos reservados.
          </div>
        </div>

        {/* SECCIÓN DERECHA: PROPÓSITO E INSTRUCCIONES */}
        <div className="login-info-section">
          <h3>¿Cómo funciona?</h3>
          
          <div className="feature-item">
            <div className="feature-icon">📅</div>
            <div className="feature-text">
              <strong>Proyección Inteligente</strong>
              <p>Divide tu monto total en días. Si no gastas hoy, el saldo se suma automáticamente a tu disponible de mañana.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⚖️</div>
            <div className="feature-text">
              <strong>Equilibrio Automático</strong>
              <p>Si te excedes un día, la app recalcula tus días siguientes para que nunca pierdas el control de tu dinero.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <div className="feature-text">
              <strong>Ingresos y Bonos</strong>
              <p>¿Recibiste dinero extra? Regístralo y tu base diaria de gasto subirá al instante para el resto del ciclo.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <div className="feature-text">
              <strong>Reportes PDF</strong>
              <p>Descarga resúmenes profesionales de tu rendimiento financiero y estadísticas de ahorro.</p>
            </div>
          </div>

          <div className="instructions-box">
            <h4>Pasos rápidos:</h4>
            <ol>
              <li>Loguéate con tu Gmail.</li>
              <li>Crea un ciclo (Monto y Días).</li>
              <li>Registra tus gastos conforme ocurran.</li>
              <li>¡Mira cómo tu dinero trabaja para ti!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;