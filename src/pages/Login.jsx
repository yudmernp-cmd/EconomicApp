import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

function Login() {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
        setExito('¡Cuenta creada! Ya puedes ingresar.');
        setModo('login');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      const mensaje = err.message || 'Error al procesar la solicitud';
      if (mensaje.includes('Invalid login')) {
        setError('Correo o contraseña incorrectos');
      } else if (mensaje.includes('already registered')) {
        setError('Este correo ya está registrado');
      } else if (mensaje.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo primero');
      } else if (mensaje.includes('Invalid path')) {
        setError('Problema de conexión. Intenta de nuevo.');
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
    <div className="login-pantalla">
      {/* Decoraciones de fondo */}
      <div className="login-decor login-decor-top-right"></div>
      <div className="login-decor login-decor-bottom-left"></div>
      <div className="login-decor login-decor-bottom-right"></div>

      <div className="login-contenido">
        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.svg" alt="Cuadra tus Lucas" />
        </div>

        {/* Título */}
        <h1 className="login-marca">
          Cuadra tus
          <br />
          <span className="login-marca-grande">Lucas</span>
        </h1>

        <p className="login-eslogan">Tu familia, en orden</p>

        {/* Subtítulo según modo */}
        <h2 className="login-subtitulo">
          {modo === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </h2>

        <p className="login-descripcion">
          {modo === 'login'
            ? 'Accede a tu cuenta para gestionar los ingresos y gastos de tu familia.'
            : 'Regístrate para empezar a organizar las finanzas de tu familia.'}
        </p>

        {/* Formulario */}
        <form onSubmit={enviar} className="login-form">
          <label className="login-campo">
            <span className="login-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M4 7L12 13L20 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="login-input"
              autoComplete="email"
              disabled={cargando}
            />
          </label>

          <label className="login-campo">
            <span className="login-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="login-input"
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              disabled={cargando}
            />
            <button
              type="button"
              className="login-ojo"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              tabIndex={-1}
            >
              {mostrarPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
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
            {cargando
              ? 'Procesando...'
              : modo === 'login'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
          </button>

          {modo === 'login' && (
            <button type="button" className="login-olvide">
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <div className="login-divisor">
            <span className="login-divisor-punto"></span>
          </div>
        </form>

        {/* Cambiar modo */}
        <p className="login-cambio">
          {modo === 'login' ? (
            <>
              ¿No tienes una cuenta?{' '}
              <button onClick={cambiarModo} className="login-cambio-btn">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={cambiarModo} className="login-cambio-btn">
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;