import { useState } from 'react';
import {
  useMovimientos,
  agregarMovimiento,
  eliminarMovimiento,
} from '../storage.js';
import { formatearSoles, formatearFecha, hoyISO } from '../utils/formatos.js';
import Card from '../components/Card.jsx';
import './MiPlata.css';

const CATEGORIAS = [
  { id: 'comida', label: 'Comida', icon: '🍞' },
  { id: 'pasaje', label: 'Pasaje', icon: '🚌' },
  { id: 'salud', label: 'Salud', icon: '💊' },
  { id: 'casa', label: 'Casa', icon: '🏠' },
  { id: 'escuela', label: 'Escuela', icon: '📚' },
  { id: 'gusto', label: 'Gusto', icon: '🎉' },
  { id: 'venta', label: 'Venta', icon: '💵' },
  { id: 'otro', label: 'Otro', icon: '📦' },
];

const FILTROS = [
  { id: 'ciclo', label: 'Este ciclo' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todo', label: 'Todo' },
];

function MiPlata() {
  const [movimientos, setMovimientos] = useMovimientos();
  const [tipo, setTipo] = useState('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('comida');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [filtro, setFiltro] = useState('todo');

  const guardar = (e) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    agregarMovimiento(setMovimientos, {
      tipo,
      monto: montoNum,
      categoria,
      descripcion: descripcion.trim(),
      fecha,
    });
    // Limpiar formulario
    setMonto('');
    setDescripcion('');
    setFecha(hoyISO());
  };

  // Filtrar movimientos
  const filtrarMovimientos = () => {
    const hoy = new Date();
    let desde = null;

    if (filtro === 'mes') {
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    } else if (filtro === 'ciclo') {
      desde = new Date();
      desde.setDate(hoy.getDate() - 7);
    }

    const lista = desde
      ? movimientos.filter((m) => new Date(m.fecha) >= desde)
      : movimientos;

    // Ordenar del más reciente al más antiguo
    return [...lista].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
  };

  const listaFiltrada = filtrarMovimientos();

  return (
    <div>
      <h1>Mi Plata</h1>
      <p className="subtitulo">Registra tus ingresos y gastos</p>

      {/* Formulario */}
      <Card>
        <form onSubmit={guardar}>
          {/* Tipo */}
          <div className="tipo-selector">
            <button
              type="button"
              className={tipo === 'gasto' ? 'tipo-btn activo-gasto' : 'tipo-btn'}
              onClick={() => setTipo('gasto')}
            >
              Gasto
            </button>
            <button
              type="button"
              className={
                tipo === 'ingreso' ? 'tipo-btn activo-ingreso' : 'tipo-btn'
              }
              onClick={() => setTipo('ingreso')}
            >
              Ingreso
            </button>
          </div>

          {/* Monto */}
          <label className="campo">
            <span className="campo-label">Monto (S/)</span>
            <input
              type="number"
              step="0.10"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              className="campo-input"
            />
          </label>

          {/* Categorías */}
          <span className="campo-label">Categoría</span>
          <div className="categorias">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={
                  categoria === cat.id
                    ? 'categoria-btn activo'
                    : 'categoria-btn'
                }
                onClick={() => setCategoria(cat.id)}
              >
                <span className="categoria-icon">{cat.icon}</span>
                <span className="categoria-label">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Descripción */}
          <label className="campo">
            <span className="campo-label">Descripción (opcional)</span>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: almuerzo, pasaje al mercado"
              className="campo-input"
              maxLength={50}
            />
          </label>

          {/* Fecha */}
          <label className="campo">
            <span className="campo-label">Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="campo-input"
            />
          </label>

          <button type="submit" className="boton-guardar">
            Guardar
          </button>
        </form>
      </Card>

      {/* Historial */}
      <h2 className="historial-titulo">Historial</h2>

      <div className="filtros">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={
              filtro === f.id ? 'filtro-btn activo' : 'filtro-btn'
            }
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {listaFiltrada.length === 0 ? (
        <p className="vacio">No hay movimientos todavía.</p>
      ) : (
        <div className="lista-movimientos">
          {listaFiltrada.map((m) => {
            const cat = CATEGORIAS.find((c) => c.id === m.categoria);
            return (
              <div key={m.id} className="movimiento">
                <span className="movimiento-icon">
                  {cat ? cat.icon : '📦'}
                </span>
                <div className="movimiento-info">
                  <span className="movimiento-desc">
                    {m.descripcion || (cat ? cat.label : 'Movimiento')}
                  </span>
                  <span className="movimiento-fecha">
                    {formatearFecha(m.fecha)}
                  </span>
                </div>
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
                <button
                  className="movimiento-eliminar"
                  onClick={() => {
                    if (confirm('¿Eliminar este movimiento?')) {
                      eliminarMovimiento(setMovimientos, m.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MiPlata;