import { useState, useEffect } from 'react';
import { usePerfil, useMovimientos, useDeudas } from '../storage.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/Card.jsx';
import './Perfil.css';

const CICLOS = [
  { id: 'semanal', label: 'Cada semana' },
  { id: 'quincenal', label: 'Cada 15 días' },
  { id: 'mensual', label: 'Cada mes' },
  { id: 'irregular', label: 'Cuando puedo' },
];

function Perfil() {
  const [perfil, setPerfil] = usePerfil();
  const [, setMovimientos] = useMovimientos();
  const [, setDeudas] = useDeudas();
  const [guardado, setGuardado] = useState(false);

  const { usuario, cerrarSesion } = useAuth();
  const { tema, alternarTema } = useTheme();

  const [form, setForm] = useState(perfil);

  useEffect(() => {
    setForm(perfil);
  }, [perfil]);

  const guardar = (e) => {
    e.preventDefault();
    setPerfil(form);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const borrarTodo = () => {
    if (
      confirm(
        '¿Seguro que quieres borrar TODOS tus datos? Esto no se puede deshacer.'
      )
    ) {
      setMovimientos([]);
      setDeudas([]);
      localStorage.removeItem('finanzas_lecciones_vistas');
      alert('Datos borrados correctamente.');
    }
  };

  const esOscuro = tema === 'dark';

  return (
    <div>
      <h1>Perfil</h1>
      <p className="subtitulo">Datos de tu familia y configuración</p>

      {/* ===== APARIENCIA ===== */}
      <h2 className="seccion-titulo">Apariencia</h2>

      <Card>
        <button
          className="tema-toggle"
          onClick={alternarTema}
          type="button"
        >
          <div className="tema-toggle-info">
            <div
              className={`tema-toggle-icono ${
                esOscuro ? 'tema-toggle-icono-oscuro' : ''
              }`}
            >
              {esOscuro ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 2V4M12 20V22M2 12H4M20 12H22M4.9 4.9L6.3 6.3M17.7 17.7L19.1 19.1M4.9 19.1L6.3 17.7M17.7 6.3L19.1 4.9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <div className="tema-toggle-texto">
              <span className="tema-toggle-titulo">
                Modo {esOscuro ? 'oscuro' : 'claro'}
              </span>
              <span className="tema-toggle-desc">
                {esOscuro
                  ? 'Toca para volver al modo claro'
                  : 'Toca para activar el modo oscuro'}
              </span>
            </div>
          </div>
          <div className={`switch ${esOscuro ? 'switch-on' : ''}`}>
            <div className="switch-bola"></div>
          </div>
        </button>
      </Card>

      {/* ===== DATOS DE LA FAMILIA ===== */}
      <h2 className="seccion-titulo">Datos de la familia</h2>

      <Card>
        <form onSubmit={guardar}>
          <label className="campo">
            <span className="campo-label">Nombre de la familia</span>
            <input
              type="text"
              value={form.nombreFamilia}
              onChange={(e) =>
                setForm({ ...form, nombreFamilia: e.target.value })
              }
              className="campo-input"
              maxLength={30}
            />
          </label>

          <label className="campo">
            <span className="campo-label">Número de integrantes</span>
            <input
              type="number"
              min="1"
              max="20"
              value={form.integrantes}
              onChange={(e) =>
                setForm({
                  ...form,
                  integrantes: parseInt(e.target.value) || 1,
                })
              }
              className="campo-input"
            />
          </label>

          <span className="campo-label">¿Cada cuánto recibes dinero?</span>
          <div className="ciclos">
            {CICLOS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={
                  form.cicloIngreso === c.id
                    ? 'ciclo-btn activo'
                    : 'ciclo-btn'
                }
                onClick={() => setForm({ ...form, cicloIngreso: c.id })}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="campo">
            <span className="campo-label">
              Ingreso aproximado por ciclo (S/)
            </span>
            <input
              type="number"
              step="0.10"
              min="0"
              value={form.ingresoEstimado}
              onChange={(e) =>
                setForm({
                  ...form,
                  ingresoEstimado: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Ej: 500"
              className="campo-input"
            />
            <span className="campo-ayuda">
              Nos ayuda a calcular mejor tu presupuesto.
            </span>
          </label>

          <button type="submit" className="boton-guardar">
            Guardar cambios
          </button>

          {guardado && (
            <p className="mensaje-guardado">✓ Cambios guardados</p>
          )}
        </form>
      </Card>

      {/* ===== CUENTA ===== */}
      <h2 className="seccion-titulo">Cuenta</h2>

      <Card>
        <div className="perfil-usuario">
          <span className="perfil-usuario-label">Sesión iniciada como</span>
          <span className="perfil-usuario-email">{usuario?.email}</span>
        </div>
        <button
          className="boton-peligro"
          onClick={() => {
            if (confirm('¿Cerrar sesión?')) {
              cerrarSesion();
            }
          }}
        >
          Cerrar sesión
        </button>
      </Card>

      {/* ===== DATOS ===== */}
      <h2 className="seccion-titulo">Datos</h2>

      <Card>
        <button className="boton-peligro" onClick={borrarTodo}>
          Borrar todos mis datos
        </button>
        <p className="advertencia">
          Esto eliminará movimientos, deudas y lecciones completadas.
        </p>
      </Card>

      <p className="version">Cuadra tus Lucas · v1.0 · Proyecto académico</p>
    </div>
  );
}

export default Perfil;