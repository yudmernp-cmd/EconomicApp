import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="cargando-app">
        <div className="cargando-spinner"></div>
        <p className="cargando-texto">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;