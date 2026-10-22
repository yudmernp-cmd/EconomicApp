import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { Link } from 'react-router-dom'; // IMPORTANTE: Agregado para el botón de olvidé contraseña
import './Login.css';

function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (modo === 'registro' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      if (modo === 'login') {
        await iniciarSesion(email.trim(), password);
      } else if (modo === 'registro') {
        await registrarse(email.trim(), password);
        setExito('¡Cuenta creada! Revisa tu correo para confirmar.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setModo('login');
      }
    } catch (err) {
      console.error(err);
      const mensaje = err.message || '';
      
      if (mensaje.includes('User already registered') || mensaje.includes('already registered')) {
        setError('Este correo ya está registrado. Por favor, inicia sesión.');
      } else if (mensaje.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (mensaje.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo primero. Revisa tu bandeja de entrada o spam.');
      } else if (mensaje.includes('Password should be at least')) {
        setError('La contraseña es muy débil. Usa al menos 6 caracteres.');
      } else if (mensaje.includes('Invalid path')) {
        setError('Problema de conexión. Intenta de nuevo.');
      } else {
        setError(mensaje || 'Ocurrió un error inesperado.');
      }
    } finally {
      setCargando(false);
    }
  };

  const loginConGoogle = async () => {
    try {
      setCargando(true);
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError('Error al conectar con Google. Intenta más tarde.');
      setCargando(false);
    }
  };

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError('');
    setExito('');
    setPassword('');
    setConfirmPassword('');
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

        <h1 className="login-marca">
          Cuadra tus
          <br />
          <span className="login-marca-grande">Lucas</span>
        </h1>

        <p className="login-eslogan">Tu familia, en orden</p>

        <h2 className="login-subtitulo">
          {modo === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </h2>

        <p className="login-descripcion">
          {modo === 'login'
            ? 'Accede a tu cuenta para gestionar los ingresos y gastos de tu familia.'
            : 'Regístrate para empezar a organizar las finanzas de tu familia.'}
        </p>

        {/* FORMULARIO PRINCIPAL */}
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
              placeholder="Correo electrónico"
              className="login-input"
              autoComplete="email"
              disabled={cargando}
            />
          </label>

          <label className="login-campo">
            <span className="login-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={modo === 'login' ? 'Contraseña' : 'Crea una contraseña (mín. 6)'}
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
              {mostrarPassword ? 'Ocultar' : 'Ver'}
            </button>
          </label>

          {modo === 'registro' && (
            <label className="login-campo">
              <span className="login-icono">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9 15L11 17L15 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                className="login-input"
                autoComplete="new-password"
                disabled={cargando}
              />
            </label>
          )}

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
            {cargando ? (
              <span className="login-spinner"></span>
            ) : modo === 'login' ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </button>

          {modo === 'login' && (
            <Link to="/recuperar-password" className="login-olvide">
              ¿Olvidaste tu contraseña?
            </Link>
          )}
        </form>
        {/* AQUÍ SE CIERRA EL FORMULARIO CORRECTAMENTE */}

        <div className="login-divisor">
          <span className="login-divisor-punto"></span>
        </div>

        <button
          type="button"
          className="login-google"
          onClick={loginConGoogle}
          disabled={cargando}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>

        <p className="login-cambio">
          {modo === 'login' ? (
            <>
              ¿No tienes una cuenta?{' '}
              <button onClick={() => cambiarModo('registro')} className="login-cambio-btn">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => cambiarModo('login')} className="login-cambio-btn">
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