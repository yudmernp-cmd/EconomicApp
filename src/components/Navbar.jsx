import { NavLink } from 'react-router-dom';
import './Navbar.css';

const items = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/mi-plata', label: 'Mi Plata', icon: '💰' },
  { path: '/prestamos', label: 'Préstamos', icon: '🚨' },
  { path: '/aprende', label: 'Aprende', icon: '🎓' },
  { path: '/perfil', label: 'Perfil', icon: '👤' },
];

function Navbar() {
  return (
    <nav className="navbar">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            'navbar-item' + (isActive ? ' activo' : '')
          }
        >
          <span className="navbar-icon">{item.icon}</span>
          <span className="navbar-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;