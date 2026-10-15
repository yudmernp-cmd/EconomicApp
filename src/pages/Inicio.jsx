import { Link } from 'react-router-dom';
import { useMovimientos, usePerfil, calcularResumen } from '../storage.js';
import { formatearSoles } from '../utils/formatos.js';
import './Inicio.css';

function Inicio() {
  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const resumen = calcularResumen(movimientos, perfil);

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const mensajes = {
    verde: 'TODO BIEN',
    amarillo: 'CUIDADO',
    rojo: 'ESTÁS EN PELIGRO',
  };

  const subtitulos = {
    verde: 'Te alcanza hasta el próximo ingreso',
    amarillo: 'Te queda poco, gasta con cuidado',
    rojo: 'No te alcanza, revisa tus gastos',
  };

  return (
    <div className="inicio">
      {/* Header */}
      <header className="inicio-header">
        <div className="inicio-saludo">
          <span className="inicio-saludo-label">{saludo},</span>
          <h1 className="inicio-saludo-nombre">{perfil.nombreFamilia}</h1>
        </div>
        <div className="inicio-avatar">
          {perfil.nombreFamilia.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Hero card */}
      <div className={`inicio-hero hero-${resumen.estado}`}>
        <div className="hero-estado">
          <span className="hero-semaforo">
            <span className="hero-semaforo-punto"></span>
          </span>
          <span className="hero-estado-texto">{mensajes[resumen.estado]}</span>
        </div>

        <div className="hero-monto">
          <span className="hero-monto-numero">
            {formatearSoles(resumen.disponible)}
          </span>
          <span className="hero-monto-label">
            disponible para {resumen.diasRestantes}{' '}
            {resumen.diasRestantes === 1 ? 'día' : 'días'}
          </span>
        </div>

        <p className="hero-subtitulo">{subtitulos[resumen.estado]}</p>
      </div>

      {/* Mini cards */}
      <div className="inicio-resumen">
        <div className="resumen-card">
          <div className="resumen-icono resumen-icono-verde">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M5 12L12 5L19 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="resumen-info">
            <span className="resumen-label">Ingresos</span>
            <span className="resumen-valor resumen-valor-verde">
              {formatearSoles(resumen.ingresos)}
            </span>
          </div>
        </div>

        <div className="resumen-card">
          <div className="resumen-icono resumen-icono-rojo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M19 12L12 19L5 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="resumen-info">
            <span className="resumen-label">Gastos</span>
            <span className="resumen-valor resumen-valor-rojo">
              {formatearSoles(resumen.gastos)}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <h2 className="acciones-titulo">Acciones rápidas</h2>

      <div className="acciones">
        <Link to="/mi-plata" className="accion">
          <span className="accion-icono">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="6"
                width="18"
                height="14"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle
                cx="12"
                cy="13"
                r="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <span className="accion-label">Registrar</span>
        </Link>

        <Link to="/prestamos" className="accion">
          <span className="accion-icono">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L2 20H22L12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M12 10V14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17" r="1.1" fill="currentColor" />
            </svg>
          </span>
          <span className="accion-label">Préstamos</span>
        </Link>

        <Link to="/aprende" className="accion">
          <span className="accion-icono">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 7L12 3L21 7L12 11L3 7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M6 10V15C6 15 8 18 12 18C16 18 18 15 18 15V10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="accion-label">Aprende</span>
        </Link>
      </div>
    </div>
  );
}

export default Inicio;