import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Navbar from './components/Navbar.jsx';
import AsistenteBurbuja from './components/AsistenteBurbuja.jsx';
import Login from './pages/Login.jsx';
import RecuperarPassword from './pages/RecuperarPassword.jsx';
import ActualizarPassword from './pages/ActualizarPassword.jsx';
import Inicio from './pages/Inicio.jsx';
import MiPlata from './pages/MiPlata.jsx';
import Prestamos from './pages/Prestamos.jsx';
import Aprende from './pages/Aprende.jsx';
import Perfil from './pages/Perfil.jsx';
import './App.css';

function LayoutPrivado() {
  const location = useLocation();

  return (
    <div className="app">
      <main className="contenido">
        <div key={location.pathname} className="pagina">
          <Routes location={location}>
            <Route path="/" element={<Inicio />} />
            <Route path="/mi-plata" element={<MiPlata />} />
            <Route path="/prestamos" element={<Prestamos />} />
            <Route path="/aprende" element={<Aprende />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </div>
      </main>
      <Navbar />
      <AsistenteBurbuja />
    </div>
  );
}

function AppContenido() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="cargando-app">
        <div className="cargando-spinner"></div>
      </div>
    );
  }

  if (location.pathname === '/login' && usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      
      {/* Ruta libre de protección para que reciba el token de Supabase */}
      <Route path="/actualizar-password" element={<ActualizarPassword />} />
      
      {/* El resto de la app SÍ está protegida */}
      <Route
        path="/*"
        element={
          <RutaProtegida>
            <LayoutPrivado />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContenido />
    </AuthProvider>
  );
}

export default App;