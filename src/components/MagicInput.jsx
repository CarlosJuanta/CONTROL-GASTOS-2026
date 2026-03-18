import React, { useState } from "react";
import { interpretarGastoConIA } from "../services/aiService";

const MagicInput = ({ onMagicData }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagic = async (e) => {
    if (e.key === "Enter" && input.trim()) {
      setLoading(true);
      const data = await interpretarGastoConIA(input);
      if (data) {
        onMagicData(data); // Enviamos los datos al formulario principal
        setInput("");
      }
      setLoading(false);
    }
  };

  return (
    <div style={styles.magicBox}>
      <span style={{ fontSize: '1.2rem' }}>✨</span>
      <input
        type="text"
        placeholder="Escribe: 'gasté 50 en cafe' y presiona Enter..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleMagic}
        disabled={loading}
        style={styles.input}
      />
      {loading && <span className="loader-mini"></span>}
    </div>
  );
};

const styles = {
  magicBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.4)',
    padding: '10px 15px',
    borderRadius: '15px',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    marginBottom: '15px',
    backdropFilter: 'blur(10px)'
  },
  input: {
    border: 'none !important',
    background: 'transparent !important',
    width: '100%',
    outline: 'none',
    fontSize: '0.9rem',
    color: '#2c3e50'
  }
};

export default MagicInput;