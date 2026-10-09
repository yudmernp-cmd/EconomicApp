import { useState, useEffect } from 'react';
import { usePerfil, useMovimientos, useDeudas } from '../storage.js';
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

  return (
    <div>
      <h1>Perfil</h1>
      <p className="subtitulo">Datos de tu familia y configuración</p>

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

      <h2 className="seccion-titulo">Datos</h2>

      <Card>
        <button className="boton-peligro" onClick={borrarTodo}>
          Borrar todos mis datos
        </button>
        <p className="advertencia">
          Esto eliminará movimientos, deudas y lecciones completadas.
        </p>
      </Card>

      <p className="version">Finanzas Familiar · v1.0 · Proyecto académico</p>
    </div>
  );
}

export default Perfil;