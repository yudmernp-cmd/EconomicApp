import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion, registrarse } = useAuth();

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      if (modo === 'login') {
        await iniciarSesion(email.trim(), password);
      } else {
        await registrarse(email.trim(), password);
        setExito('¡Cuenta creada! Revisa tu correo para confirmar.');
      }
    } catch (err) {
      console.error(err);
      const mensaje = err.message || 'Error al procesar la solicitud';
      if (mensaje.includes('Invalid login')) {
        setError('Correo o contraseña incorrectos');
      } else if (mensaje.includes('already registered')) {
        setError('Este correo ya está registrado');
      } else if (mensaje.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo primero. Revisa tu bandeja.');
      } else {
        setError(mensaje);
      }
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login');
    setError('');
    setExito('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icono">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="6"
                width="18"
                height="14"
                rx="2.5"
                stroke="white"
                strokeWidth="2"
              />
              <circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="login-titulo">Finanzas Familiar</h1>
          <p className="login-subtitulo">
            {modo === 'login'
              ? 'Ingresa a tu cuenta'
              : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <form onSubmit={enviar} className="login-form">
          <label className="login-campo">
            <span className="login-campo-label">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="login-input"
              autoComplete="email"
              disabled={cargando}
            />
          </label>

          <label className="login-campo">
            <span className="login-campo-label">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="login-input"
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
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

          <button
            type="submit"
            className="login-boton"
            disabled={cargando}
          >
            {cargando
              ? 'Procesando...'
              : modo === 'login'
              ? 'Ingresar'
              : 'Crear cuenta'}
          </button>
        </form>

        <div className="login-cambio">
          {modo === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button onClick={cambiarModo} className="login-cambio-btn">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={cambiarModo} className="login-cambio-btn">
                Ingresa
              </button>
            </>
          )}
        </div>

        <p className="login-nota">
          Tus datos se guardan de forma segura en tu dispositivo y en
          Supabase.
        </p>
      </div>
    </div>
  );
}

export default Login;