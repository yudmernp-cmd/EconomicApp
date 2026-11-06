import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const Iconos = {
  Inicio: ({ activo }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={activo ? 'currentColor' : 'none'}
        fillOpacity={activo ? 0.15 : 0}
      />
    </svg>
  ),
  MiPlata: ({ activo }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
        fill={activo ? 'currentColor' : 'none'}
        fillOpacity={activo ? 0.15 : 0}
      />
      <circle
        cx="12"
        cy="13"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  Prestamos: ({ activo }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3L2 20H22L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill={activo ? 'currentColor' : 'none'}
        fillOpacity={activo ? 0.15 : 0}
      />
      <path
        d="M12 10V14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  ),
  Aprende: ({ activo }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7L12 3L21 7L12 11L3 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill={activo ? 'currentColor' : 'none'}
        fillOpacity={activo ? 0.15 : 0}
      />
      <path
        d="M6 10V15C6 15 8 18 12 18C16 18 18 15 18 15V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Perfil: ({ activo }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        fill={activo ? 'currentColor' : 'none'}
        fillOpacity={activo ? 0.15 : 0}
      />
      <path
        d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill={activo ? 'currentColor' : 'none'}
        fillOpacity={activo ? 0.1 : 0}
      />
    </svg>
  ),
};

const ITEMS = [
  { path: '/', label: 'Inicio', key: 'Inicio' },
  { path: '/mi-plata', label: 'Mi Plata', key: 'MiPlata' },
  { path: '/prestamos', label: 'Préstamos', key: 'Prestamos' },
  { path: '/aprende', label: 'Aprende', key: 'Aprende' },
  { path: '/perfil', label: 'Perfil', key: 'Perfil' },
];

function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <Link to="/" className="navbar-marca" aria-label="Cuadra tus Lucas, inicio">
        <img src="/logo.svg" alt="" />
        <span>Cuadra tus<br /><strong>Lucas<span className="navbar-punto">.</span></strong></span>
      </Link>
      <span className="navbar-seccion">TU ESPACIO FINANCIERO</span>
      <div className="navbar-enlaces">
      {ITEMS.map((item) => {
        const Icono = Iconos[item.key];
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              'navbar-item' + (isActive ? ' activo' : '')
            }
          >
            {({ isActive }) => (
              <>
                <span className="navbar-icono" aria-hidden="true">
                  <Icono activo={isActive} />
                </span>
                <span className="navbar-label">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
      </div>
      <div className="navbar-consejo">
        <span aria-hidden="true">✦</span>
        <strong>Un paso a la vez.</strong>
        <p>Cada gasto que registras te ayuda a decidir mejor.</p>
      </div>
      <span className="navbar-pie">Hecho para tu familia · Perú</span>
    </nav>
  );
}

export default Navbar;