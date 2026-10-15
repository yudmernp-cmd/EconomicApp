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

          <button
            type="button"
            className="login-google"
            onClick={() => alert('Login con Google próximamente')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </form>

        {/* Cambiar modo */}
        <p className="login-cambio">
                  <p className="login-eslogan-final">
          Mejores decisiones,
          <br />
          <em>mejores sueños</em>
        </p>
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