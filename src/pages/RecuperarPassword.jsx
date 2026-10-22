import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import './Login.css'; // Reutilizamos los estilos del login

function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#/actualizar-password`,
      });
      if (error) throw error;
      setExito('Te enviamos un correo con las instrucciones. Revisa tu bandeja de entrada o spam.');
      setEmail('');
    } catch (err) {
      if (err.message.includes('rate limit')) {
        setError('Demasiados intentos. Espera un momento antes de volver a intentar.');
      } else {
        setError(err.message || 'Error al enviar el correo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pantalla">
      <div className="login-decor login-decor-top-right"></div>
      <div className="login-decor login-decor-bottom-left"></div>
      <div className="login-decor login-decor-bottom-right"></div>

      <div className="login-contenido">
        <div className="login-logo">
          <img src="/logo.svg" alt="Cuadra tus Lucas" />
        </div>

        <h2 className="login-subtitulo">Recupera tu contraseña</h2>
        <p className="login-descripcion">
          Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        <form onSubmit={enviar} className="login-form">
          <label className="login-campo">
            <span className="login-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="login-input"
              disabled={cargando}
            />
          </label>

          {error && (
            <div className="login-mensaje login-error">
              <span>⚠️</span> {error}
            </div>
          )}
          {exito && (
            <div className="login-mensaje login-exito">
              <span>✅</span> {exito}
            </div>
          )}

          <button type="submit" className="login-boton" disabled={cargando}>
            {cargando ? <span className="login-spinner"></span> : 'Enviar enlace'}
          </button>
        </form>

        <p className="login-cambio" style={{ marginTop: '20px' }}>
          <Link to="/login" className="login-cambio-btn" style={{ textDecoration: 'none' }}>
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RecuperarPassword;