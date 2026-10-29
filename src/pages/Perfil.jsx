import { useState, useEffect } from 'react';
import { usePerfil, useMovimientos, useDeudas } from '../storage.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import './Perfil.css';

const CICLOS = [
  { id: 'semanal', label: 'Semanal' }, { id: 'quincenal', label: 'Quincenal' },
  { id: 'mensual', label: 'Mensual' }, { id: 'irregular', label: 'Irregular' },
];

function Perfil() {
  const [perfil, setPerfil] = usePerfil();
  const [, setMovimientos] = useMovimientos();
  const [, setDeudas] = useDeudas();
  const [guardado, setGuardado] = useState(false);
  const { usuario, cerrarSesion } = useAuth();
  const [form, setForm] = useState(perfil);
  
  // --- NUEVOS ESTADOS PARA EXPORTAR ---
  const [exportando, setExportando] = useState(false);
  const [urlSheets, setUrlSheets] = useState(null);

  useEffect(() => { setForm(perfil); }, [perfil]);

  const guardar = (e) => {
    e.preventDefault();
    setPerfil(form);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const borrarTodo = () => {
    if (confirm('¿Borrar TODOS tus datos? Esto no se puede deshacer.')) {
      setMovimientos([]); setDeudas([]);
      localStorage.removeItem('finanzas_lecciones_vistas');
      alert('Datos borrados.');
    }
  };

  // --- NUEVA FUNCIÓN PARA EXPORTAR ---
  const exportarDatos = async () => {
    setExportando(true);
    setUrlSheets(null);
    try {
      // Traemos los datos guardados en el navegador
      const movimientos = JSON.parse(localStorage.getItem('finanzas_movimientos') || '[]');
      const deudas = JSON.parse(localStorage.getItem('finanzas_deudas') || '[]');

      // Llamamos a nuestro backend en Vercel
      const respuesta = await fetch('/api/exportar-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movimientos, deudas }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) throw new Error(data.error || 'Error al exportar');

      setUrlSheets(data.url);
      alert('¡Datos exportados con éxito!');
    } catch (error) {
      alert(error.message || 'Error al exportar a Google Sheets');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="perfil-contenedor">
      <h1>Perfil</h1>
      <p className="perfil-subtitulo">Datos de tu familia y configuración.</p>

      <Card>
        <div className="perfil-usuario-info">
          <div className="perfil-avatar">{usuario?.email?.charAt(0).toUpperCase()}</div>
          <div>
            <span className="perfil-email">{usuario?.email}</span>
            <span className="perfil-cuenta-label">Cuenta activa</span>
          </div>
        </div>
      </Card>

      <h2 className="perfil-seccion-titulo">Datos de la familia</h2>
      <Card>
        <form onSubmit={guardar} className="perfil-form">
          <label className="perfil-campo">
            <span className="perfil-label">Nombre de la familia</span>
            <input type="text" value={form.nombreFamilia} onChange={(e) => setForm({ ...form, nombreFamilia: e.target.value })} className="perfil-input" />
          </label>
          <label className="perfil-campo">
            <span className="perfil-label">Integrantes</span>
            <input type="number" min="1" max="20" value={form.integrantes} onChange={(e) => setForm({ ...form, integrantes: parseInt(e.target.value) || 1 })} className="perfil-input" />
          </label>
          
          <span className="perfil-label">Frecuencia de ingresos</span>
          <div className="perfil-ciclos">
            {CICLOS.map((c) => (
              <button key={c.id} type="button" className={form.cicloIngreso === c.id ? 'perfil-btn-ciclo activo' : 'perfil-btn-ciclo'} onClick={() => setForm({ ...form, cicloIngreso: c.id })}>
                {c.label}
              </button>
            ))}
          </div>

          <label className="perfil-campo" style={{ marginTop: '12px' }}>
            <span className="perfil-label">Ingreso aprox. por ciclo (S/)</span>
            <input type="number" value={form.ingresoEstimado} onChange={(e) => setForm({ ...form, ingresoEstimado: parseFloat(e.target.value) || 0 })} className="perfil-input" />
          </label>

          <button type="submit" className="perfil-btn-guardar">Guardar Cambios</button>
          {guardado && <span className="perfil-guardado-msg">✓ Guardado</span>}
        </form>
      </Card>

      {/* --- NUEVA SECCIÓN DE EXPORTAR --- */}
      <h2 className="perfil-seccion-titulo">Exportar Datos</h2>
      <Card>
        <p style={{ fontSize: '13px', color: 'var(--gris-600)', marginBottom: '16px', lineHeight: '1.4' }}>
          Copia tus movimientos y deudas a una hoja de cálculo de Google para verlos como en Excel o compartirlos.
        </p>
        <button 
          type="button" 
          className="perfil-btn-guardar" 
          style={{ background: '#0F9D58', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          onClick={exportarDatos}
          disabled={exportando}
        >
          {exportando ? 'Exportando...' : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2"/>
                <path d="M7 8H17M7 12H17M7 16H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Exportar a Google Sheets
            </>
          )}
        </button>
        
        {urlSheets && (
          <a 
            href={urlSheets} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#0F9D58', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
          >
            Ver mi hoja de cálculo →
          </a>
        )}
      </Card>

      <h2 className="perfil-seccion-titulo">Cuenta y Seguridad</h2>
      <Card>
        <button className="perfil-btn-logout" onClick={() => confirm('¿Cerrar sesión?') && cerrarSesion()}>
          Cerrar sesión
        </button>
        <button className="perfil-btn-peligro" onClick={borrarTodo}>
          Borrar todos mis datos locales
        </button>
        <p className="perfil-advertencia">Esto eliminará movimientos, deudas y lecciones guardadas en este dispositivo.</p>
      </Card>
      
      <p className="perfil-version">Cuadra tus Lucas · v1.0</p>
    </div>
  );
}
export default Perfil;