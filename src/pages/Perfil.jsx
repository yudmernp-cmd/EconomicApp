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