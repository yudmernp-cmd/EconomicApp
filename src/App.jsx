import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AsistenteBurbuja from './components/AsistenteBurbuja.jsx';
import Inicio from './pages/Inicio.jsx';
import MiPlata from './pages/MiPlata.jsx';
import Prestamos from './pages/Prestamos.jsx';
import Aprende from './pages/Aprende.jsx';
import Perfil from './pages/Perfil.jsx';

function App() {
  return (
    <div className="app">
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/mi-plata" element={<MiPlata />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/aprende" element={<Aprende />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
      <Navbar />
      <AsistenteBurbuja />
    </div>
  );
}

export default App;