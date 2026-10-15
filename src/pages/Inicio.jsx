import { Link } from 'react-router-dom';
import { useMovimientos, usePerfil, calcularResumen } from '../storage.js';
import { formatearSoles } from '../utils/formatos.js';
import './Inicio.css';

const CATEGORIAS = [
  { id: 'casa', label: 'Vivienda', icon: '🏠', color: 'verde' },
  { id: 'comida', label: 'Alimentación', icon: '🍽️', color: 'naranja' },
  { id: 'pasaje', label: 'Transporte', icon: '🚗', color: 'azul' },
  { id: 'otro', label: 'Otros', icon: '⋯', color: 'purpura' },
];

function Inicio() {
  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const resumen = calcularResumen(movimientos, perfil);

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  // Calcular gastos por categoría
  const gastosPorCategoria = CATEGORIAS.map((cat) => {
    const total = movimientos
      .filter((m) => m.tipo === 'gasto' && m.categoria === cat.id)
      .reduce((sum, m) => sum + Number(m.monto), 0);
    const porcentaje =
      resumen.gastos > 0 ? (total / resumen.gastos) * 100 : 0;
    return { ...cat, total, porcentaje };
  });

  // Últimos 3 movimientos
  const ultimosMovimientos = [...movimientos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 3);

  const totalGastado = resumen.gastos;
  const ahorro = Math.max(0, resumen.ingresos - resumen.gastos);
  const porcentajeGastado =
    resumen.ingresos > 0
      ? Math.min(100, (resumen.gastos / resumen.ingresos) * 100)
      : 0;
  const porcentajeAhorro =
    resumen.ingresos > 0
      ? Math.min(100, (ahorro / resumen.ingresos) * 100)
      : 0;

  return (
    <div className="inicio">
      {/* ===== HEADER ===== */}
      <header className="inicio-header">
        <div className="inicio-logo-titulo">
          <div className="inicio-logo-mini">
            <img src="/logo.svg" alt="Cuadra tus Lucas" />
          </div>
          <div className="inicio-marca">
            <h1 className="inicio-marca-titulo">
              Cuadra tus
              <br />
              <span className="inicio-marca-grande">Lucas</span>
            </h1>
            <p className="inicio-marca-eslogan">Tu familia, en orden</p>
          </div>
        </div>
        <div className="inicio-avatar">
          {perfil.nombreFamilia.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* ===== BANNER INGRESO MENSUAL ===== */}
      <div className="inicio-banner">
        <div className="banner-info">
          <span className="banner-label">Ingreso mensual familiar</span>
          <span className="banner-monto">
            {formatearSoles(resumen.ingresos)}
          </span>
          <span className="banner-fecha">
            Este mes · {resumen.diasRestantes} días restantes
          </span>
        </div>
        <div className="banner-icono">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect
              x="8"
              y="14"
              width="32"
              height="24"
              rx="3"
              fill="#F8D548"
            />
            <rect
              x="8"
              y="14"
              width="32"
              height="8"
              rx="3"
              fill="#E8C230"
            />
            <rect x="30" y="22" width="14" height="10" rx="2" fill="#0F5132" />
            <circle cx="37" cy="27" r="2" fill="#F8D548" />
          </svg>
        </div>
      </div>

      {/* ===== CATEGORÍAS ===== */}
      <div className="inicio-categorias">
        {gastosPorCategoria.map((cat) => (
          <div key={cat.id} className="categoria-card">
            <div className={`categoria-icono cat-${cat.color}`}>
              <span>{cat.icon}</span>
            </div>
            <span className="categoria-label">{cat.label}</span>
            <span className="categoria-monto">{formatearSoles(cat.total)}</span>
            <div className="categoria-barra">
              <div
                className={`categoria-barra-fill barra-${cat.color}`}
                style={{ width: `${cat.porcentaje}%` }}
              ></div>
            </div>
            <span className="categoria-porcentaje">
              {cat.porcentaje.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* ===== DISPONIBLE ===== */}
      <div className="inicio-disponible">
        <div className="disponible-icono">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C8 3 5 6 5 10C5 14 7 16 8 18H16C17 16 19 14 19 10C19 6 16 3 12 3Z"
              fill="#0F5132"
            />
            <circle cx="10" cy="10" r="1" fill="white" />
            <circle cx="14" cy="10" r="1" fill="white" />
            <path
              d="M10 14C10.5 14.5 13.5 14.5 14 14"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="disponible-info">
          <span className="disponible-label">Disponible</span>
          <span className="disponible-monto">
            {formatearSoles(resumen.disponible)}
          </span>
        </div>
        <Link to="/mi-plata" className="disponible-link">
          Ver detalles →
        </Link>
      </div>

      {/* ===== RESUMEN DEL MES ===== */}
      <h2 className="seccion-titulo">Resumen del mes</h2>

      <div className="inicio-resumen-cards">
        <div className="resumen-fila">
          <div className="resumen-fila-icono resumen-fila-icono-verde">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          </div>
          <div className="resumen-fila-info">
            <span className="resumen-fila-label">Total gastado</span>
            <div className="resumen-fila-barra">
              <div
                className="resumen-fila-barra-fill"
                style={{ width: `${porcentajeGastado}%` }}
              ></div>
            </div>
          </div>
          <div className="resumen-fila-valor">
            <span className="resumen-fila-monto">
              {formatearSoles(totalGastado)}
            </span>
            <span className="resumen-fila-porcentaje">
              {porcentajeGastado.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="resumen-fila">
          <div className="resumen-fila-icono resumen-fila-icono-purpura">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20V10L12 4L20 10V20H4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M9 20V14H15V20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="resumen-fila-info">
            <span className="resumen-fila-label">Ahorro</span>
            <div className="resumen-fila-barra">
              <div
                className="resumen-fila-barra-fill barra-purpura"
                style={{ width: `${porcentajeAhorro}%` }}
              ></div>
            </div>
          </div>
          <div className="resumen-fila-valor">
            <span className="resumen-fila-monto">{formatearSoles(ahorro)}</span>
            <span className="resumen-fila-porcentaje">
              {porcentajeAhorro.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* ===== ÚLTIMOS MOVIMIENTOS ===== */}
      <div className="inicio-movimientos-header">
        <h2 className="seccion-titulo">Últimos movimientos</h2>
        <Link to="/mi-plata" className="ver-todos">
          Ver todos →
        </Link>
      </div>

      {ultimosMovimientos.length === 0 ? (
        <div className="inicio-vacio">
          <p>Aún no hay movimientos</p>
        </div>
      ) : (
        <div className="inicio-movimientos">
          {ultimosMovimientos.map((m) => {
            const cat = CATEGORIAS.find((c) => c.id === m.categoria);
            const icono = cat?.icon || '📦';
            const color = cat?.color || 'gris';
            return (
              <div key={m.id} className="movimiento-item">
                <div className={`movimiento-icono mov-${color}`}>
                  <span>{icono}</span>
                </div>
                <div className="movimiento-info">
                  <span className="movimiento-nombre">
                    {m.descripcion || cat?.label || 'Movimiento'}
                  </span>
                  <span className="movimiento-categoria">
                    {cat?.label || 'Otro'}
                  </span>
                </div>
                <div className="movimiento-derecha">
                  <span
                    className={
                      m.tipo === 'ingreso'
                        ? 'movimiento-monto verde'
                        : 'movimiento-monto rojo'
                    }
                  >
                    {m.tipo === 'ingreso' ? '+' : '−'}{' '}
                    {formatearSoles(m.monto)}
                  </span>
                  <span className="movimiento-fecha">
                    {new Date(m.fecha).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== ACCIONES RÁPIDAS ===== */}
      <h2 className="seccion-titulo" style={{ marginTop: '20px' }}>
        Acciones rápidas
      </h2>

      <div className="acciones">
        <Link to="/mi-plata" className="accion">
          <span className="accion-icono">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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