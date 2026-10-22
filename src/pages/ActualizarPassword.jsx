import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import './Login.css';

function ActualizarPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sesionValida, setSesionValida] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        if (isMounted) {
          setSesionValida(true);
          setVerificando(false);
        }
      } else {
        // Si no hay sesión, le damos 2 segundos a Supabase para que lea el enlace
        const timer = setTimeout(() => {
          if (isMounted) setVerificando(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    verificarSesion();

    // Escuchamos si Supabase crea la sesión mientras estamos en esta pantalla
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && isMounted) {
        setSesionValida(true);
        setVerificando(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      
      setExito('¡Contraseña actualizada! Serás redirigido al login.');
      
      // Cerramos sesión para que tenga que entrar con su nueva clave
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
      setCargando(false);
    }
  };

  if (verificando) {
    return (
      <div className="login-pantalla">
        <div className="cargando-app" style={{ background: 'transparent' }}>
          <div className="cargando-spinner"></div>
          <p className="cargando-texto">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!sesionValida) {
    return (
      <div className="login-pantalla">
        <div className="login-contenido" style={{ textAlign: 'center' }}>
          <h2 className="login-subtitulo">Enlace inválido o expirado</h2>
          <p className="login-descripcion">Por favor, solicita un nuevo enlace de recuperación.</p>
          <button className="login-boton" onClick={() => navigate('/recuperar-password')}>
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-pantalla">
      <div className="login-contenido">
        <div className="login-logo">
          <img src="/logo.svg" alt="Cuadra tus Lucas" />
        </div>

        <h2 className="login-subtitulo">Nueva contraseña</h2>
        <p className="login-descripcion">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>

        <form onSubmit={enviar} className="login-form">
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
              placeholder="Nueva contraseña"
              className="login-input"
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
              placeholder="Confirma tu nueva contraseña"
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
            {cargando ? <span className="login-spinner"></span> : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ActualizarPassword;