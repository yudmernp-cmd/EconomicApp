import { Link } from 'react-router-dom';
import { useMovimientos, usePerfil, calcularResumen } from '../storage.js';
import { formatearSoles } from '../utils/formatos.js';
import Semaforo from '../components/Semaforo.jsx';
import Card from '../components/Card.jsx';
import './Inicio.css';

function Inicio() {
  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const resumen = calcularResumen(movimientos, perfil);

  const mensajes = {
    verde: 'Vas bien este ciclo',
    amarillo: 'Cuidado con tus gastos',
    rojo: 'Estás en peligro',
  };

  const subtitulos = {
    verde: 'Te alcanza hasta el próximo ingreso',
    amarillo: 'Te queda poco, gasta con cuidado',
    rojo: 'No te alcanza, revisa tus gastos',
  };

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      <header className="inicio-header">
        <div className="inicio-saludo">
          <span className="inicio-saludo-label">{saludo},</span>
          <h1 className="inicio-saludo-nombre">{perfil.nombreFamilia}</h1>
        </div>
        <div className="inicio-avatar" aria-hidden="true">
          {perfil.nombreFamilia.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Hero card con el estado */}
      <Card className="card-hero inicio-hero" animDelay={60}>
        <div className="hero-semaforo">
          <Semaforo estado={resumen.estado} />
          <span className="hero-estado-label">{mensajes[resumen.estado]}</span>
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

        {resumen.disponible > 0 && (
          <div className="hero-por-dia">
            <span className="hero-por-dia-label">Puedes gastar</span>
            <span className="hero-por-dia-numero">
              {formatearSoles(resumen.disponiblePorDia)} / día
            </span>
          </div>
        )}
      </Card>

      {/* Resumen mini */}
      <div className="resumen-fila">
        <Card className="resumen-mini" animDelay={120}>
          <div className="mini-icono mini-icono-verde">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M5 12L12 5L19 12"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mini-info">
            <span className="mini-label">Ingresos</span>
            <span className="mini-valor verde">
              {formatearSoles(resumen.ingresos)}
            </span>
          </div>
        </Card>

        <Card className="resumen-mini" animDelay={180}>
          <div className="mini-icono mini-icono-rojo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M19 12L12 19L5 12"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mini-info">
            <span className="mini-label">Gastos</span>
            <span className="mini-valor rojo">
              {formatearSoles(resumen.gastos)}
            </span>
          </div>
        </Card>
      </div>

      <h2 className="acciones-titulo">Acciones rápidas</h2>

      <div className="acciones">
        <Link to="/mi-plata" className="accion" style={{ animationDelay: '240ms' }}>
          <span className="accion-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="6"
                width="18"
                height="14"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="accion-label">Registrar</span>
        </Link>

        <Link to="/prestamos" className="accion" style={{ animationDelay: '300ms' }}>
          <span className="accion-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 22H22L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 9V13"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17" r="1.2" fill="currentColor" />
            </svg>
          </span>
          <span className="accion-label">Préstamos</span>
        </Link>

        <Link to="/aprende" className="accion" style={{ animationDelay: '360ms' }}>
          <span className="accion-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 7L12 3L21 7L12 11L3 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M6 10V15C6 15 8 18 12 18C16 18 18 15 18 15V10"
                stroke="currentColor"
                strokeWidth="2"
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